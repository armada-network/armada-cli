import { Arg } from "@oclif/core/lib/interfaces";
import { TransactionCommand } from "../../base";
import { getContract, getSigner, normalizeHash, pretty, run } from "../../helpers";

export default class ProjectOwner extends TransactionCommand {
  static description = "Transfer ownership of a project.";
  static examples = ["<%= config.bin %> <%= command.id %> 0x123abc... 0x456def..."];
  static usage = "<%= command.id %> ID ADDR";
  static aliases = ["project:owner", "project:transfer"];
  static args: Arg[] = [
    { name: "ID", description: "The ID of the project to change owner.", required: true },
    { name: "ADDR", description: "The address of the new project owner.", required: true },
  ];

  public async run(): Promise<unknown> {
    const { args, flags } = await this.parse(ProjectOwner);
    const signer = await getSigner(flags.network, flags.rpc, flags.address, flags.signer, flags.key);
    const projects = await getContract(flags.network, flags.abi, "ArmadaProjects", signer);
    const projectId = normalizeHash(args.ID);
    const tx = await projects.populateTransaction.setProjectOwner(projectId, args.ADDR);
    const output = await run(tx, signer, [projects]);
    this.log(pretty(output));
    return output;
  }
}
