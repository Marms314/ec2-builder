import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs';

export class Ec2BuilderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Creates the bare minimum to play with the envoy proxy sandboxes. Create a keypair before use and enter the name below, as well as your ip CIDR
    const myIPCIDR = 'replace me!';
    const myKeyPairName = 'replace me!';

    const vpc = new ec2.Vpc(this, 'builder-vpc', {
      maxAzs: 1,
    });

    const securityGroup = new ec2.SecurityGroup(this, 'builder-sg', {
      vpc,
      description: "Allows ingress for ephemeral ports, user ip, and  all outbound",
      allowAllOutbound: true
    });
    securityGroup.addIngressRule(ec2.Peer.ipv4('0.0.0.0/0'), ec2.Port.tcpRange(32768, 61000), 'allow inbound ephemeral ports for downloads')
    securityGroup.addIngressRule(ec2.Peer.ipv4(myIPCIDR), ec2.Port.allTraffic(), 'allow ingress from my ip')

    const instance = new ec2.Instance(this, 'builder-ec2', {
      vpc,
      securityGroup: securityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      keyName: myKeyPairName,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.SMALL),
      machineImage: ec2.MachineImage.genericLinux({'us-east-1': 'ami-05a5f6298acdb05b6'}) // Red hat 9
    });

    instance.userData.addCommands(
      'sudo yum install -y yum-utils',
      'sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo',
      'sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y',
      'sudo systemctl start docker',
      'sudo groupadd docker',
      'sudo usermod -aG docker ec2-user',
      'newgrp docker',
      'sudo service docker restart',
      'sudo dnf install git-all -y',
      'sudo dnf install jq -y',
      'cd /home/ec2-user',
      'git clone https://github.com/envoyproxy/envoy.git'
    );
  }
}
