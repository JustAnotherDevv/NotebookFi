# NotebookFi

<p align="center">
<br />
    <img src="/images/logo.png" width="60" alt="logo"/>
<br />
</p>

**A decentralized knowledge marketplace powered by Pi Network**

NotebookFi is a Web3 content monetization platform that enables creators to share premium educational content, tutorials, and digital resources while earning Pi cryptocurrency directly from their audience. The platform eliminates traditional intermediaries, allowing creators to retain full control over their content and pricing.

## For Creators:

- Publish premium content (tutorials, courses, guides, articles)
- Set custom pricing in Pi tokens
- Multiple content formats supported (text, images, videos, mixed media)
- Direct monetization without platform fees
- Build and grow follower base
- Track earnings and engagement metrics

## For Consumers:

- Discover quality educational content across multiple categories
- Secure, one-time purchases using Pi cryptocurrency
- Permanent access to purchased content
- Preview content before purchasing
- Follow favorite creators
- Curated creator marketplace

## Use Cases

NotebookFi serves various creator types including digital artists sharing technique guides, developers offering coding tutorials, fitness coaches providing workout plans, designers selling templates and resources, educators creating course materials, and subject matter experts sharing specialized knowledge.

## Setup

Configure app for testnet in the Pi browser moboile app, get Wallet, API key, endpoints etc.

### Dapp

- `cd dapp`
- setup `.env` file
- `npm run dev`

### Backend

- Run docker with mongob:

```
docker run --name demoapp-mongo -d \
  -e MONGO_INITDB_ROOT_USERNAME=demoapp -e MONGO_INITDB_ROOT_PASSWORD=dev_password \
  -p 27017:27017 mongo:5.0
```

- Install dependencies with `yarn install`
- Fill out `.env` file
- Start server `yarn start`
