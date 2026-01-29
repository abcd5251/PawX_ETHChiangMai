
import { DynamicEvmWalletClient } from "@dynamic-labs-wallet/node-evm";
import { DynamicSvmWalletClient } from "@dynamic-labs-wallet/node-svm";
import { ThresholdSignatureScheme } from "@dynamic-labs-wallet/node";

const ENVIRONMENT_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID;

if (!ENVIRONMENT_ID) {
    throw new Error("NEXT_PUBLIC_DYNAMIC_ENV_ID is not set in environment variables");
}

/**
 * Creates an authenticated EVM wallet client for server-side operations.
 * This client can be used to perform actions on behalf of the user's wallet.
 */
export const getAuthenticatedEvmClient = async ({
    authToken,
}: {
    authToken: string;
}) => {
    const client = new DynamicEvmWalletClient({
        environmentId: ENVIRONMENT_ID,
        enableMPCAccelerator: true, 
    });

    await client.authenticateApiToken(authToken);
    return client;
};

/**
 * Creates an authenticated Solana (SVM) wallet client for server-side operations.
 */
export const getAuthenticatedSvmClient = async ({
    authToken,
}: {
    authToken: string;
}) => {
    const client = new DynamicSvmWalletClient({
        environmentId: ENVIRONMENT_ID,
    });

    await client.authenticateApiToken(authToken);
    return client;
};

/**
 * Creates a new Server Wallet for a user.
 * This wallet is custodial/server-managed and can be used for automation.
 * 
 * @param authToken The user's auth token (if associating with a logged-in user)
 * @param walletProperties Optional properties to set for the wallet
 */
export const createServerEvmWallet = async ({
    authToken,
    walletProperties = {}
}: {
    authToken: string;
    walletProperties?: any;
}) => {
    const client = await getAuthenticatedEvmClient({ authToken });
    
    // Create a new wallet account with the specified threshold scheme
    // TWO_OF_TWO means both shares are needed (standard for server wallets usually implies different setup, 
    // but here we are using the SDK's capability to create a wallet).
    const wallet = await client.createWalletAccount({
        thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
        ...walletProperties
    });

    return wallet;
};

/**
 * Example of how to sign a message using the server wallet.
 */
export const signMessageWithServerWallet = async ({
    client,
    message,
    walletId
}: {
    client: DynamicEvmWalletClient;
    message: string;
    walletId: string;
}) => {
    // Note: For MPC wallets, you typically need the user's share.
    // However, if this is a purely server-managed wallet created via API 
    // where the server holds enough shares (or using Turnkey integration), this works.
    // If this is a user's embedded wallet, this might fail without user interaction/passkey unless
    // using the specific "Server-Side Wallet" flow.
    
    // This function assumes the client is already authenticated and capable of signing.
    // Dynamic SDK signMessage signature might vary, typically it requires message.
    // If it's a specific wallet operation, we might need to select the wallet first or pass accountAddress if supported.
    // Based on the error, 'walletId' is not a valid property.
    // We'll assume the client is initialized for a specific wallet or we need to pass accountAddress instead.
    
    // Fetch the wallet first to get the address if needed, or if the client is already scoped.
    // For now, let's remove walletId and assume the client context is sufficient or we need to look up the wallet.
    
    // If we need to specify which wallet to use, we might need to find it first.
    const wallets = await client.getWallets();
    const wallet = wallets.find((w: any) => w.id === walletId);
    
    if (!wallet) {
        throw new Error(`Wallet with ID ${walletId} not found`);
    }

    return await client.signMessage({
        message,
        accountAddress: wallet.address
    });
};
