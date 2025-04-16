# R5 GUI Desktop Wallet

Open source development repository of the R5 GUI Desktop Wallet.

## Python Wallet

We started developing the GUI in Python, but switched over to Electron/TS, so the unfinished Python GUI (inside `/python`) is there just for archive and historical purposes. If you want to continue developing it as an alternative to the Electron/TS GUI, please feel free to send your Pull Requests.

## Electron Wallet

Main GUI developed using Electron and TypeScript. It has all basic functions for users to manage their funds on the R5 Network, plus a few extra unique functions, such as allowing users to export their wallets into a "Wallet File" for backup purposes, and import given files into the app at a later date.

**This wallet is still under heavy development, so bugs and glitches are to be expected.**

Feel free to contribute to the GUI development by submitting your PRs.

## Copying/Forking

Please follow the GNU General Public License guidelines for reproducing the contents of this repository, including the attribution requirements and maintaining modified code open source.

## Running

You can copy the repository by using `git clone`:

```bash
git clone https://github.com/r5-labs/r5-wallet
```

Navigate to the `electron` directory using `cd`:

```bash
cd r5-wallet/electron
```

Install all dependencies with `npm`:

```bash
npm install
```

And use `npm` again to run the development environment:

```bash
npm run dev
```

## Building

Building instructions will be posted here in the near future.
