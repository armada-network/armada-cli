import { Command, Flags } from "@oclif/core";
import { CommandError } from "@oclif/core/lib/interfaces";
import { SignerType, SignerTypes } from "./helpers";
import { NetworkName, NetworkNames } from "./networks";

type TxError = { error: { reason: string } };

export abstract class BlockchainCommand extends Command {
  static globalFlags = {
    network: Flags.enum<NetworkName>({
      helpGroup: "BASE",
      description: "The network to use.",
      options: NetworkNames,
      default: "testnet",
    }),
    abi: Flags.string({
      helpGroup: "BASE",
      description: "The ABI base directory.",
      helpValue: "DIR",
    }),
    rpc: Flags.string({
      helpGroup: "BASE",
      description: "Ethereum node endpoint.",
      helpValue: "URL",
    }),
  };

  static enableJsonFlag = true;
}

export abstract class TransactionCommand extends BlockchainCommand {
  static globalFlags = {
    ...super.globalFlags,
    address: Flags.string({
      helpGroup: "BASE",
      description: "The account address to use (keystore only).",
      helpValue: "ADDR",
      exclusive: ["signer", "key"],
    }),
    signer: Flags.enum<SignerType>({
      helpGroup: "BASE",
      description: "The method for signing transactions.",
      options: SignerTypes,
      default: "keystore",
      exclusive: ["address", "key"],
    }),
    account: Flags.string({
      helpGroup: "BASE",
      description: "Account derivation number if using Ledger, starts at 0.",
      helpValue: "N",
      exclusive: ["address", "key"],
      default: "0",
      relationships: [
        { type: "all", flags: [{ name: "signer", when: async (flags) => flags["signer"] === "ledger" }] },
      ],
    }),
    key: Flags.string({
      helpGroup: "BASE",
      description: "The private key for transactions (danger).",
      helpValue: "KEY",
      exclusive: ["address", "signer"],
    }),
  };

  async catch(error: CommandError | TxError): Promise<void> {
    if (!process.env.DEBUG && "error" in error && "reason" in error.error) {
      this.error(error.error.reason);
    } else {
      throw error;
    }
  }
}
