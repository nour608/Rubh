const [major] = process.versions.node.split(".").map(Number)

if (major < 20 || major >= 25) {
  console.error(
    `Unsupported Node.js ${process.versions.node}. Required range is >=20 <25.`
  )
  console.error(
    "Please install Node 20 LTS or higher before running npm commands."
  )
  process.exit(1)
}
