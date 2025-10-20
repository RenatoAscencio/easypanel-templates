import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName || "zender-wa",
      env: [
        `PCODE=${input.pcode}`,
        `KEY=${input.licenseKey}`,
        `PORT=${input.port || 7001}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.image || "renatoascencio/zender-wa:latest",
      },
      domains: [
        {
          host: input.domain || "$(EASYPANEL_DOMAIN)",
          port: input.port || 7001,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/whatsapp-server",
        },
      ],
      ports: [
        {
          published: input.port || 7001,
          target: 443, // El contenedor siempre escucha en 443 internamente
        },
      ],
      deploy: {
        replicas: 1,
        command: "/usr/local/bin/entrypoint.sh",
        zeroDowntime: true,
        resources: {
          limits: {
            memory: input.memoryLimit || "1G",
            cpus: input.cpuLimit || "1.0",
          },
          reservations: {
            memory: input.memoryReservation || "256M",
            cpus: input.cpuReservation || "0.25",
          },
        },
        restartPolicy: {
          condition: "on-failure",
          delay: "5s",
          maxAttempts: 3,
        },
      },
      healthcheck: {
        test: ["/usr/local/bin/status-wa"],
        interval: "30s",
        timeout: "10s",
        startPeriod: "60s",
        retries: 3,
      },
    },
  });

  return { services };
}
