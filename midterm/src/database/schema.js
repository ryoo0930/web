'use strict';
const { entities } = require('../routes/entities');
const common = `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`;
function statements() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS fm_roles (name VARCHAR(30) PRIMARY KEY, description VARCHAR(300) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS fm_role_permissions (role VARCHAR(30) NOT NULL, permission VARCHAR(100) NOT NULL, PRIMARY KEY(role,permission), FOREIGN KEY(role) REFERENCES fm_roles(name))`,
    `CREATE TABLE IF NOT EXISTS fm_crews (${common}, name VARCHAR(100) NOT NULL, description TEXT, status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', leader_id BIGINT UNSIGNED NULL, archived BOOLEAN NOT NULL DEFAULT FALSE)`,
    `CREATE TABLE IF NOT EXISTS fm_members (${common}, name VARCHAR(100) NOT NULL, email VARCHAR(254), bio TEXT, role VARCHAR(30) NOT NULL DEFAULT 'Associate', status VARCHAR(30) NOT NULL DEFAULT 'PENDING', crew_id BIGINT UNSIGNED NULL, archived BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY(role) REFERENCES fm_roles(name), FOREIGN KEY(crew_id) REFERENCES fm_crews(id), INDEX(crew_id,status))`,
    `CREATE TABLE IF NOT EXISTS fm_accounts (${common}, username VARCHAR(80) NOT NULL UNIQUE, member_id BIGINT UNSIGNED NOT NULL UNIQUE, password_hash VARCHAR(200) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', version INT NOT NULL DEFAULT 1, failed_attempts INT NOT NULL DEFAULT 0, locked_until DATETIME NULL, archived BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY(member_id) REFERENCES fm_members(id))`,
    `CREATE TABLE IF NOT EXISTS fm_management (member_id BIGINT UNSIGNED NOT NULL, crew_id BIGINT UNSIGNED NOT NULL, PRIMARY KEY(member_id,crew_id), FOREIGN KEY(member_id) REFERENCES fm_members(id), FOREIGN KEY(crew_id) REFERENCES fm_crews(id))`,
    `CREATE TABLE IF NOT EXISTS fm_tasks (${common}, title VARCHAR(200) NOT NULL, description TEXT, crew_id BIGINT UNSIGNED NOT NULL, starts_at DATETIME(3) NOT NULL, ends_at DATETIME(3) NOT NULL, priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL', exclusive BOOLEAN NOT NULL DEFAULT TRUE, status VARCHAR(30) NOT NULL DEFAULT 'PLANNED', result TEXT, archived BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY(crew_id) REFERENCES fm_crews(id), CHECK(starts_at < ends_at), INDEX(crew_id,status,starts_at))`,
    `CREATE TABLE IF NOT EXISTS fm_participations (${common}, task_id BIGINT UNSIGNED NOT NULL, member_id BIGINT UNSIGNED NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED', contribution TEXT, UNIQUE(task_id,member_id), FOREIGN KEY(task_id) REFERENCES fm_tasks(id), FOREIGN KEY(member_id) REFERENCES fm_members(id))`,
    `CREATE TABLE IF NOT EXISTS fm_resources (${common}, name VARCHAR(150) NOT NULL, description TEXT, crew_id BIGINT UNSIGNED NOT NULL, asset_tag VARCHAR(80) NOT NULL UNIQUE, location VARCHAR(200), category_id BIGINT UNSIGNED NULL, location_id BIGINT UNSIGNED NULL, status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', archived BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY(crew_id) REFERENCES fm_crews(id), INDEX(crew_id,status))`,
    `CREATE TABLE IF NOT EXISTS fm_reservations (${common}, resource_id BIGINT UNSIGNED NOT NULL, task_id BIGINT UNSIGNED NULL, member_id BIGINT UNSIGNED NOT NULL, starts_at DATETIME(3) NOT NULL, ends_at DATETIME(3) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'RESERVED', checked_out_at DATETIME(3), returned_at DATETIME(3), reason TEXT, FOREIGN KEY(resource_id) REFERENCES fm_resources(id), FOREIGN KEY(task_id) REFERENCES fm_tasks(id), FOREIGN KEY(member_id) REFERENCES fm_members(id), CHECK(starts_at < ends_at), INDEX(resource_id,status,starts_at))`,
    `CREATE TABLE IF NOT EXISTS fm_sessions (sid VARCHAR(128) PRIMARY KEY, data MEDIUMTEXT NOT NULL, expires BIGINT NOT NULL, account_id BIGINT UNSIGNED NULL, INDEX(expires), INDEX(account_id))`,
    `CREATE TABLE IF NOT EXISTS fm_outbox (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, event_id VARCHAR(36) NOT NULL UNIQUE, collection_name VARCHAR(80) NOT NULL, payload JSON NOT NULL, delivered_at DATETIME(3), attempts INT NOT NULL DEFAULT 0, last_error VARCHAR(50), next_attempt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), INDEX(delivered_at,next_attempt))`,
    `CREATE TABLE IF NOT EXISTS fm_mutex (id INT PRIMARY KEY)`,
    `CREATE TABLE IF NOT EXISTS fm_settings (name VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL)`
  ];
  for (const d of Object.values(entities).filter(e => !e.core)) {
    const columns = Object.entries(d.fields).map(([key, spec]) => {
      const type = spec.type === 'id' ? 'BIGINT UNSIGNED' : spec.type === 'number' ? 'INT' : spec.type === 'date' ? 'DATETIME(3)' : spec.enum ? 'VARCHAR(30)' : spec.max <= 300 ? `VARCHAR(${spec.max})` : 'TEXT';
      return `\`${key}\` ${type}${spec.required ? ' NOT NULL' : ''}`;
    });
    const relations = [];
    for (const key of Object.keys(d.fields).filter(k => k.endsWith('_id'))) {
      const target = key === d.parent ? entities[d.parentEntity].table : ({crew_id:'fm_crews',member_id:'fm_members',predecessor_id:'fm_tasks'})[key];
      if (target) relations.push(`FOREIGN KEY(${key}) REFERENCES ${target}(id)`);
    }
    if (d.key === 'task-dependencies') relations.push('UNIQUE(task_id,predecessor_id)');
    if (d.key === 'training-enrollments') relations.push('UNIQUE(training_id,member_id)');
    tables.push(`CREATE TABLE IF NOT EXISTS ${d.table} (${common}, ${columns.join(', ')}, status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', outcome TEXT, author_id BIGINT UNSIGNED NOT NULL, archived BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY(author_id) REFERENCES fm_members(id), ${relations.join(', ')}, INDEX(status,archived))`);
  }
  return tables;
}
module.exports = { statements };
