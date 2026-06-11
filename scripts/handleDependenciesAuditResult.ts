async function main() {
  process.stdin.setEncoding("utf8");
  let auditDataText = "";
  for await (const chunk of process.stdin) auditDataText += chunk;

  const auditData = JSON.parse(auditDataText);

  const { info, low, moderate, high, critical, total } =
    auditData.metadata.vulnerabilities;
  if (total == 0 || total == info) {
    console.log("No vulnerabilities found");
    return;
  }

  if (
    critical > 0 ||
    high > 0 ||
    moderate > 0 ||
    (low > 0 && process.env.IS_CD == "true")
  ) {
    let countSummary: string[] = [];
    if (critical > 0) countSummary.push(`${critical} critical`);
    if (high > 0) countSummary.push(`${high} high`);
    if (moderate > 0) countSummary.push(`${moderate} moderate`);
    if (low > 0) countSummary.push(`${low} low`);

    console.error(
      `::error::Found ${total - info} vulnerabilities (${countSummary.join(", ")})`,
    );
    console.error(JSON.stringify(auditData.vulnerabilities, null, 2));
    process.exit(1);
  }

  if (low > 0) {
    console.log(`::warning::Found ${low} low severity vulnerabilities`);
  }
}

main();
