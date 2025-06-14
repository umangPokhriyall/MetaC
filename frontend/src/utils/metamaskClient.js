import MetaMaskSDK from "@metamask/sdk";

const MMSDK = new MetaMaskSDK({
  injectProvider: true,
  dappMetadata: {
    name: "MiniDex",
    url: window.location.href,
  },
});

export async function getEthereumProvider() {
  // Wait until window.ethereum is available (in case it loads late)
  if (typeof window.ethereum === "undefined") {
    await new Promise((resolve) =>
      window.addEventListener("ethereum#initialized", resolve, {
        once: true,
 })
    );
  }

  return MMSDK.getProvider() ?? window.ethereum;
}
