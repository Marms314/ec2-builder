This project builds an AWS EC2 with the tools to use the Envoy Proxy sandboxes preloaded.
https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/

Before deploying this project, create a keypair in AWS and identify your IP.
Then go to lib\ec2-builder-stack.ts and add those values to lines 10 and 11.
Then once the project is deployed, you can SSH into the EC2 instance and jump right into the sandboxes by navigating to envoy/examples.