/** @type {import('sequelize-cli').Migration} */
const migration = {
  async up(queryInterface, Sequelize) {
    const [tableResult] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'announcements'
      ) AS exists;
    `);

    if (tableResult?.[0]?.exists) {
      return;
    }

    await queryInterface.createTable("announcements", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    const [tableResult] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'announcements'
      ) AS exists;
    `);

    if (!tableResult?.[0]?.exists) {
      return;
    }

    await queryInterface.dropTable("announcements");
  },
};

export default migration;
