import { readFileSync } from "fs";
import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.dbServiceName || "kepler-db",
      source: {
        type: "image",
        image: "mariadb:11.4",
      },
      env: [
        `MYSQL_ROOT_PASSWORD=${input.mysqlRootPassword || randomPassword()}`,
        `MYSQL_DATABASE=${input.mysqlDatabase || "kepler"}`,
        `MYSQL_USER=${input.mysqlUser || "kepler"}`,
        `MYSQL_PASSWORD=${input.mysqlPassword || randomPassword()}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "mariadb-data",
          mountPath: "/var/lib/mysql",
        },
        {
          type: "file",
          mountPath: "/docker-entrypoint-initdb.d/kepler.sql",
          content: readFileSync(__dirname + "/assets/kepler.sql", "utf-8"),
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName || "kepler",
      source: {
        type: "image",
        image: input.image || "quackster/kepler:latest",
      },
      env: [
        `SERVER_BIND=0.0.0.0`,
        `SERVER_PORT=${input.serverPort || 12321}`,
        `RCON_BIND=0.0.0.0`,
        `RCON_PORT=${input.rconPort || 12309}`,
        `MUS_BIND=0.0.0.0`,
        `MUS_PORT=${input.musPort || 12322}`,
        `MYSQL_HOSTNAME=${input.dbServiceName || "kepler-db"}`,
        `MYSQL_PORT=3306`,
        `MYSQL_USER=${input.mysqlUser || "kepler"}`,
        `MYSQL_PASSWORD=${input.mysqlPassword || randomPassword()}`,
        `MYSQL_DATABASE=${input.mysqlDatabase || "kepler"}`,
        `MARIADB_ROOT_PASSWORD=${input.mysqlRootPassword || randomPassword()}`,
        `LOG_RECEIVED_PACKETS=false`,
        `LOG_SENT_PACKETS=false`,
        `DEBUG=false`,
      ].join("\n"),
      ports: [
        {
          published: input.serverPort || 12321,
          target: input.serverPort || 12321,
        },
        { published: input.rconPort || 12309, target: input.rconPort || 12309 },
        { published: input.musPort || 12322, target: input.musPort || 12322 },
      ],
    },
  });

  return { services };
}
