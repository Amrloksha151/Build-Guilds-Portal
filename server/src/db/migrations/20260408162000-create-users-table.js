/** @type {import('sequelize-cli').Migration} */
const migration = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      role: {
        type: Sequelize.ENUM("admin", "organizer", "participant"),
        allowNull: false,
        defaultValue: "participant",
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");

    // Clean up postgres enum type created for the users.role column.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  },
};

export default migration;
