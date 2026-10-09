export function isConnectionCapacityError(error) {
  return error?.code === "ER_TOO_MANY_USER_CONNECTIONS" || error?.code === "ER_CON_COUNT_ERROR" ||
    (error?.code === "ER_USER_LIMIT_REACHED" && /max_user_connections/i.test(error.sqlMessage || error.message || ""));
}

export function createManagedPool(rawPool, {
  attempts = 4,
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  random = Math.random,
} = {}) {
  // mysql2 emits release only when there are no queued borrowers. Close now;
  // a serverless instance can suspend before an idle-timeout timer runs.
  rawPool.on("release", (connection) => connection.destroy());

  const getConnection = async () => {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await rawPool.getConnection();
      } catch (error) {
        if (!isConnectionCapacityError(error) || attempt + 1 >= attempts) throw error;
        await wait(250 * 2 ** attempt + Math.floor(random() * 100));
      }
    }
  };

  return {
    getConnection,
    async query(sql, values) {
      const connection = await getConnection();
      try {
        return await connection.query(sql, values);
      } finally {
        connection.release();
      }
    },
    end: () => rawPool.end(),
  };
}
