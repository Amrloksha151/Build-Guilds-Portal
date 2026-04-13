/** @type {import('sequelize-cli').Migration} */
const migration = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("teams", {
    "id": {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    "name": {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    }
  });
    await queryInterface.addColumn("users", "TeamId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "teams",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "TeamId");
    await queryInterface.dropTable("teams");
  },
};

export default migration;
