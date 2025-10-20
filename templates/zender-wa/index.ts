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
        `PORT=443`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.image || "renatoascencio/zender-wa:latest",
      },
      domains: [
        {
          host: input.domain || "$(EASYPANEL_DOMAIN)",
          port: 443,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/whatsapp-server",
        },
      ],
      deploy: {
        replicas: 1,
        command: null,
        zeroDowntime: true,
      },
    },
  });

  return { services };
}
