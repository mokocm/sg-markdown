const AWS = require("aws-sdk");
const table = require("markdown-table");

const ec2 = new AWS.EC2({ region: "ap-northeast-1" });

ec2.describeSecurityGroups({}, (err, data) => {
  if (err) return console.log(err);
  const securityGroups = new Map();

  for (sg of data.SecurityGroups) securityGroups.set(sg.GroupId, sg.GroupName);

  for (const sg of data.SecurityGroups) {
    const markdownRows = [];
    markdownRows.push(["Name", "Protocol", "PortRange", "Source"]);
    for (const ingress of sg.IpPermissions) {
      const protocol = ingress.IpProtocol;
      const port =
        ingress.FromPort === ingress.ToPort
          ? ingress.FromPort
          : `${ingress.FromPort} - ${ingress.ToPort}`;
      let source = null;

      for (const ip of ingress.IpRanges) {
        if (source === null) source = ip.CidrIp;
        else source += `<br> ${ip.CidrIp}`;
      }

      for (const group of ingress.UserIdGroupPairs) {
        if (source === null) source = securityGroups.get(group.GroupId);
        else source += `<br> ${securityGroups.get(group.GroupId)}`;
      }
      markdownRows.push([sg.GroupName, protocol, port, source]);
    }
    console.log(`## ${sg.GroupName}`);
    console.log(table(markdownRows));
  }
});
