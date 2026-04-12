import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import sequelize from "../src/db/sequelize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const modelsDir = path.resolve(projectRoot, "src/models");
const migrationsDir = path.resolve(projectRoot, "src/db/migrations");

function parseArgs(argv) {
  const args = {
    name: "auto-schema-sync",
    debug: false,
    dryRun: false,
    fallbackEmpty: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--name") {
      args.name = argv[index + 1] ?? args.name;
      index += 1;
      continue;
    }

    if (token.startsWith("--name=")) {
      args.name = token.split("=").slice(1).join("=") || args.name;
      continue;
    }

    if (token === "--debug") {
      args.debug = true;
      continue;
    }

    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (token === "--no-fallback-empty") {
      args.fallbackEmpty = false;
      continue;
    }
  }

  return args;
}

function logDebug(enabled, message, data) {
  if (!enabled) {
    return;
  }

  if (data === undefined) {
    console.log(`[debug] ${message}`);
    return;
  }

  console.log(`[debug] ${message}`, data);
}

function toMigrationName(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "auto-schema-sync";
}

function serializeDefaultValue(defaultValue) {
  if (defaultValue === undefined) {
    return null;
  }

  if (defaultValue && typeof defaultValue === "object" && defaultValue.key === "UUIDV4") {
    return "Sequelize.UUIDV4";
  }

  if (defaultValue && typeof defaultValue === "object" && defaultValue.key === "NOW") {
    return "Sequelize.NOW";
  }

  if (defaultValue === null) {
    return "null";
  }

  const primitiveType = typeof defaultValue;
  if (primitiveType === "string" || primitiveType === "number" || primitiveType === "boolean") {
    return JSON.stringify(defaultValue);
  }

  return null;
}

function getExpectedAllowNull(attribute) {
  if (typeof attribute.allowNull === "boolean") {
    return attribute.allowNull;
  }

  if (attribute.primaryKey === true) {
    return false;
  }

  return true;
}

function serializeDataType(type) {
  const key = type?.key;
  const options = type?.options ?? {};

  if (!key) {
    throw new Error("Unsupported Sequelize type: missing key.");
  }

  switch (key) {
    case "UUID":
    case "DATE":
    case "TEXT":
    case "INTEGER":
    case "BIGINT":
    case "BOOLEAN":
    case "FLOAT":
    case "DOUBLE":
    case "REAL":
    case "JSON":
    case "JSONB":
    case "BLOB":
      return `Sequelize.${key}`;
    case "STRING": {
      const length = options.length ?? type._length;
      return length ? `Sequelize.STRING(${length})` : "Sequelize.STRING";
    }
    case "DECIMAL": {
      const precision = options.precision ?? type._precision;
      const scale = options.scale ?? type._scale;
      if (precision != null && scale != null) {
        return `Sequelize.DECIMAL(${precision}, ${scale})`;
      }
      if (precision != null) {
        return `Sequelize.DECIMAL(${precision})`;
      }
      return "Sequelize.DECIMAL";
    }
    case "ENUM": {
      const enumValues = Array.isArray(type.values) ? type.values : [];
      const serializedValues = enumValues.map((value) => JSON.stringify(value)).join(", ");
      return `Sequelize.ENUM(${serializedValues})`;
    }
    default:
      throw new Error(`Unsupported Sequelize type key: ${key}`);
  }
}

function serializeColumnDefinition(attribute) {
  const lines = [
    `type: ${serializeDataType(attribute.type)},`,
    `allowNull: ${getExpectedAllowNull(attribute)},`,
  ];

  if (attribute.primaryKey === true) {
    lines.push("primaryKey: true,");
  }

  if (attribute.autoIncrement === true) {
    lines.push("autoIncrement: true,");
  }

  if (attribute.unique === true) {
    lines.push("unique: true,");
  }

  const serializedDefault = serializeDefaultValue(attribute.defaultValue);
  if (serializedDefault !== null) {
    lines.push(`defaultValue: ${serializedDefault},`);
  }

  if (attribute.references?.model && attribute.references?.key) {
    lines.push("references: {");
    lines.push(`  model: ${JSON.stringify(attribute.references.model)},`);
    lines.push(`  key: ${JSON.stringify(attribute.references.key)},`);
    lines.push("},");

    if (attribute.onUpdate) {
      lines.push(`onUpdate: ${JSON.stringify(attribute.onUpdate)},`);
    }
    if (attribute.onDelete) {
      lines.push(`onDelete: ${JSON.stringify(attribute.onDelete)},`);
    }
  }

  return `{
      ${lines.join("\n      ")}
    }`;
}

function normalizeDbType(typeName) {
  return String(typeName || "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isTypeEquivalent(modelType, dbType) {
  const key = modelType?.key;
  const normalizedDbType = normalizeDbType(dbType);

  if (!key) {
    return true;
  }

  if (key === "STRING") {
    return normalizedDbType.includes("CHARACTER VARYING") || normalizedDbType.includes("VARCHAR");
  }

  if (key === "TEXT") {
    return normalizedDbType.includes("TEXT");
  }

  if (key === "DATE") {
    return normalizedDbType.includes("TIMESTAMP") || normalizedDbType.includes("DATE");
  }

  if (key === "UUID") {
    return normalizedDbType.includes("UUID");
  }

  if (key === "ENUM") {
    return normalizedDbType.includes("USER-DEFINED") || normalizedDbType.includes("ENUM");
  }

  if (key === "INTEGER") {
    return normalizedDbType.includes("INTEGER") || normalizedDbType.includes("INT4");
  }

  if (key === "BIGINT") {
    return normalizedDbType.includes("BIGINT") || normalizedDbType.includes("INT8");
  }

  if (key === "BOOLEAN") {
    return normalizedDbType.includes("BOOLEAN") || normalizedDbType.includes("BOOL");
  }

  return normalizedDbType.includes(key);
}

async function loadModels(debug) {
  const fileNames = (await readdir(modelsDir)).filter((fileName) => fileName.endsWith(".js"));

  for (const fileName of fileNames) {
    const filePath = path.resolve(modelsDir, fileName);
    const source = await readFile(filePath, "utf8");

    if (!source.trim()) {
      logDebug(debug, `Skipping empty model file: ${fileName}`);
      continue;
    }

    try {
      await import(pathToFileURL(filePath).href);
    } catch (error) {
      throw new Error(`Failed to import model ${fileName}: ${error.message}`);
    }
  }

  return Object.values(sequelize.models);
}

async function listDatabaseTables() {
  const queryInterface = sequelize.getQueryInterface();
  const rawTables = await queryInterface.showAllTables();

  return rawTables
    .map((table) => {
      if (typeof table === "string") {
        return table;
      }

      if (table?.tableName) {
        return table.tableName;
      }

      return null;
    })
    .filter(Boolean);
}

async function collectDiff(models, debug) {
  const queryInterface = sequelize.getQueryInterface();
  const databaseTables = await listDatabaseTables();
  const diff = {
    createTables: [],
    addColumns: [],
    changeColumns: [],
  };

  for (const model of models) {
    const tableName = model.getTableName();
    const normalizedTableName = typeof tableName === "string" ? tableName : tableName.tableName;
    const attributes = model.rawAttributes;

    if (!normalizedTableName || !attributes || Object.keys(attributes).length === 0) {
      continue;
    }

    if (!databaseTables.includes(normalizedTableName)) {
      diff.createTables.push({ tableName: normalizedTableName, attributes });
      continue;
    }

    const describedTable = await queryInterface.describeTable(normalizedTableName);
    const dbColumns = new Map(Object.entries(describedTable));

    for (const [columnName, attribute] of Object.entries(attributes)) {
      const dbColumn = dbColumns.get(columnName);

      if (!dbColumn) {
        diff.addColumns.push({ tableName: normalizedTableName, columnName, attribute });
        continue;
      }

      const allowNullChanged = Boolean(dbColumn.allowNull) !== Boolean(getExpectedAllowNull(attribute));
      const typeChanged = !isTypeEquivalent(attribute.type, dbColumn.type);

      if (allowNullChanged || typeChanged) {
        diff.changeColumns.push({
          tableName: normalizedTableName,
          columnName,
          attribute,
          current: dbColumn,
          reason: {
            allowNullChanged,
            typeChanged,
          },
        });
      }
    }
  }

  logDebug(debug, "Database tables", databaseTables);
  logDebug(debug, "Computed diff", diff);
  return diff;
}

function renderMigrationSource(diff) {
  const upStatements = [];
  const downStatements = [];

  for (const entry of diff.createTables) {
    const columns = Object.entries(entry.attributes)
      .map(
        ([columnName, attribute]) =>
          `    ${JSON.stringify(columnName)}: ${serializeColumnDefinition(attribute)}`
      )
      .join(",\n");

    upStatements.push(`await queryInterface.createTable(${JSON.stringify(entry.tableName)}, {\n${columns}\n  });`);
    downStatements.unshift(`await queryInterface.dropTable(${JSON.stringify(entry.tableName)});`);
  }

  for (const entry of diff.addColumns) {
    upStatements.push(
      `await queryInterface.addColumn(${JSON.stringify(entry.tableName)}, ${JSON.stringify(entry.columnName)}, ${serializeColumnDefinition(
        entry.attribute
      )});`
    );
    downStatements.unshift(
      `await queryInterface.removeColumn(${JSON.stringify(entry.tableName)}, ${JSON.stringify(entry.columnName)});`
    );
  }

  for (const entry of diff.changeColumns) {
    upStatements.push(
      `await queryInterface.changeColumn(${JSON.stringify(entry.tableName)}, ${JSON.stringify(entry.columnName)}, ${serializeColumnDefinition(
        entry.attribute
      )});`
    );
  }

  if (upStatements.length === 0) {
    return null;
  }

  const downBody = downStatements.length > 0 ? downStatements.join("\n    ") : "// Manual rollback may be required for changeColumn operations.";

  return `/** @type {import('sequelize-cli').Migration} */
const migration = {
  async up(queryInterface, Sequelize) {
    ${upStatements.join("\n    ")}
  },

  async down(queryInterface, Sequelize) {
    ${downBody}
  },
};

export default migration;
`;
}

async function createEmptyMigrationViaWrapper(name, debug) {
  const beforeFiles = new Set(await readdir(migrationsDir));

  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.resolve(projectRoot, "scripts/generate-migration.mjs"), "--name", name],
      {
        cwd: projectRoot,
        stdio: "inherit",
      }
    );

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Fallback migration generation failed with exit code ${code ?? "unknown"}.`));
    });
  });

  const afterFiles = await readdir(migrationsDir);
  const newFiles = afterFiles.filter((fileName) => !beforeFiles.has(fileName));
  logDebug(debug, "Fallback migration created", newFiles);
}

async function createGeneratedMigration(name, source, debug, dryRun) {
  const beforeFiles = new Set(await readdir(migrationsDir));

  if (!dryRun) {
    await new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        [path.resolve(projectRoot, "scripts/generate-migration.mjs"), "--name", name],
        {
          cwd: projectRoot,
          stdio: "inherit",
        }
      );

      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(`Migration generation failed with exit code ${code ?? "unknown"}.`));
      });
    });
  }

  const afterFiles = dryRun ? Array.from(beforeFiles) : await readdir(migrationsDir);
  const createdFiles = afterFiles.filter((fileName) => !beforeFiles.has(fileName)).filter((fileName) => fileName.endsWith(".js"));

  if (dryRun) {
    console.log("[dry-run] Migration content preview:\n");
    console.log(source);
    return;
  }

  if (createdFiles.length !== 1) {
    throw new Error(`Expected one generated migration file but found ${createdFiles.length}.`);
  }

  const migrationFile = createdFiles[0];
  const migrationPath = path.resolve(migrationsDir, migrationFile);
  await writeFile(migrationPath, source, "utf8");
  logDebug(debug, "Wrote generated migration", migrationFile);
  console.log(`Generated migration: ${migrationFile}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const migrationName = toMigrationName(options.name);

  try {
    logDebug(options.debug, "Starting model diff generation", options);
    const models = await loadModels(options.debug);
    const diff = await collectDiff(models, options.debug);
    const migrationSource = renderMigrationSource(diff);

    if (!migrationSource) {
      console.log("No schema differences detected between models and database.");

      if (!options.fallbackEmpty) {
        return;
      }

      if (options.dryRun) {
        console.log("[dry-run] Fallback enabled: would create an empty migration skeleton.");
        return;
      }

      await createEmptyMigrationViaWrapper(`${migrationName}-fallback`, options.debug);
      return;
    }

    await createGeneratedMigration(migrationName, migrationSource, options.debug, options.dryRun);
  } catch (error) {
    console.error("[auto-migration] Failed to generate migration from model diff.");
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

await main();