import test from "node:test";
import assert from "node:assert/strict";

async function me() {
  let response = await fetch(
    "https://backboard.railway.app/graphql/internal?q=me",
    {
      headers: {
        authorization: "Bearer " + process.env.RAILWAY_API_TOKEN,
        "content-type": "application/json",
      },
      body: '{"query":"query me {\\n  me {\\n    ...UserFields\\n  }\\n}\\n\\nfragment UserFields on User {\\n  id\\n  email\\n  name\\n  username\\n  avatar\\n  profile {\\n    ...UserProfileFields\\n  }\\n  isAdmin\\n  createdAt\\n  flags\\n  featureFlags\\n  agreedFairUse\\n  termsAgreedOn\\n  isDevPlan\\n  isOnHobbyPlan\\n  isEligibleForFreeHobbyPlan\\n  isVerified\\n  banReason\\n  projects {\\n    edges {\\n      node {\\n        id\\n        name\\n        deletedAt\\n        isPublic\\n      }\\n    }\\n  }\\n  providerAuths {\\n    edges {\\n      node {\\n        id\\n        provider\\n        metadata\\n      }\\n    }\\n  }\\n  teams {\\n    edges {\\n      node {\\n        ...TeamFields\\n      }\\n    }\\n  }\\n}\\n\\nfragment UserProfileFields on UserProfile {\\n  bio\\n  website\\n  isPublic\\n}\\n\\nfragment TeamFields on Team {\\n  id\\n  name\\n  avatar\\n  createdAt\\n  customer {\\n    ...RichCustomerFields\\n  }\\n  teamPermissions {\\n    id\\n    userId\\n    role\\n  }\\n  projects {\\n    edges {\\n      node {\\n        id\\n        teamId\\n        name\\n        deletedAt\\n      }\\n    }\\n  }\\n  discordRole\\n  banReason\\n  isEligibleForDirectSupport\\n}\\n\\nfragment RichCustomerFields on Customer {\\n  id\\n  state\\n  isUsageSubscriber\\n  stripeCustomerId\\n  creditBalance\\n  isTrialing\\n  isPrepaying\\n  planLimitOverride {\\n    id\\n    config\\n  }\\n  billingPeriod {\\n    start\\n    end\\n  }\\n  defaultPaymentMethod {\\n    id\\n    card {\\n      last4\\n    }\\n  }\\n  credits {\\n    edges {\\n      node {\\n        ...CreditFields\\n      }\\n    }\\n  }\\n}\\n\\nfragment CreditFields on Credit {\\n  id\\n  amount\\n  memo\\n  createdAt\\n  type\\n}","operationName":"me"}',
      method: "POST",
    },
  );

  if (!response.ok) throw "HTTP request failed: " + response.status;

  let json = await response.json();
  return json.data.me.name;
}

test(async function () {
  assert.equal("Paulus Esterhazy", await me());
});
