/** @type {import('sequelize-cli').Migration} */
const migration = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("csrf_tokens", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      sessionSid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: "sessions",
          key: "sid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tokenHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("csrf_tokens", ["sessionSid"]);
    await queryInterface.addIndex("csrf_tokens", ["expiresAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("csrf_tokens");
  },
};

export default migration;
