import { readdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const migrationsDir = path.resolve(projectRoot, "src/db/migrations");

const beforeFiles = new Set(await readdir(migrationsDir));

const sequelizeCliEntrypoint = path.resolve(projectRoot, "node_modules/sequelize-cli/lib/sequelize");
const cliArgs = [sequelizeCliEntrypoint, "migration:generate", ...process.argv.slice(2)];

await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, cliArgs, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false,
  });

  child.on("error", reject);
  child.on("exit", (code) => {
    if (code === 0) {
      resolve();
      return;
    }

    reject(new Error(`Migration generation failed with exit code ${code ?? "unknown"}.`));
  });
});

const afterFiles = await readdir(migrationsDir);
const createdMigrations = afterFiles
  .filter((fileName) => !beforeFiles.has(fileName))
  .filter((fileName) => fileName.endsWith(".js"));

if (createdMigrations.length === 0) {
  throw new Error("No new migration file was detected in src/db/migrations.");
}

if (createdMigrations.length > 1) {
  throw new Error(
    `Expected one new migration file, but found ${createdMigrations.length}: ${createdMigrations.join(
      ", "
    )}`
  );
}

const createdMigrationFile = createdMigrations[0];
const migrationPath = path.resolve(migrationsDir, createdMigrationFile);

const esmMigrationTemplate = `/** @type {import('sequelize-cli').Migration} */
const migration = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

export default migration;
`;

await writeFile(migrationPath, esmMigrationTemplate, "utf8");
console.log(`Updated ${createdMigrationFile} to ESM migration template.`);