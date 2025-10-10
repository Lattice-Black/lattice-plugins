# Stripe Webhook Testing Guide

This guide will help you test Stripe webhooks locally using the Stripe CLI.

## Prerequisites

- Stripe CLI installed (`brew install stripe/stripe-cli/stripe`)
- Your API server running (`yarn dev`)

## Quick Start

### 1. Start the Stripe Webhook Listener

In a new terminal, run:

```bash
yarn stripe:listen
```

This will:
- Forward Stripe events to `http://localhost:3000/api/v1/webhooks/stripe`
- Display a webhook signing secret (starts with `whsec_`)
- Show all webhook events in real-time

**Important:** Copy the webhook signing secret from the output and temporarily update your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"  # Use the CLI secret for local testing
```

### 2. Trigger Test Events

In another terminal, you can trigger test webhook events:

```bash
# Test successful checkout
yarn stripe:test:checkout

# Test subscription update
yarn stripe:test:subscription

# Test successful payment
yarn stripe:test:payment
```

## Available Test Commands

| Command | Description | Event Type |
|---------|-------------|------------|
| `yarn stripe:test:checkout` | Simulate completed checkout | `checkout.session.completed` |
| `yarn stripe:test:subscription` | Simulate subscription update | `customer.subscription.updated` |
| `yarn stripe:test:payment` | Simulate successful payment | `invoice.payment_succeeded` |

## Manual Event Triggering

You can also trigger any Stripe event manually:

```bash
# List available events
stripe trigger --help

# Trigger specific events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

## Testing Workflow

### Terminal 1: API Server
```bash
cd /Users/cwolff/Code/lattice/packages/api
yarn dev
```

### Terminal 2: Stripe Webhook Forwarder
```bash
cd /Users/cwolff/Code/lattice/packages/api
yarn stripe:listen
```

### Terminal 3: Event Triggering
```bash
cd /Users/cwolff/Code/lattice/packages/api
yarn stripe:test:checkout
```

## Webhook Events Handled

Our webhook endpoint (`/api/v1/webhooks/stripe`) handles:

- ✅ `checkout.session.completed` - Creates/updates subscription after checkout
- ✅ `customer.subscription.created` - New subscription created
- ✅ `customer.subscription.updated` - Subscription modified
- ✅ `customer.subscription.deleted` - Subscription cancelled
- ✅ `invoice.payment_succeeded` - Successful payment
- ✅ `invoice.payment_failed` - Failed payment (logged for monitoring)

## Debugging Tips

1. **Watch the webhook listener output** - It shows each event sent to your endpoint
2. **Check your API logs** - Your server will log webhook processing
3. **Verify signature** - The CLI webhook secret is different from production
4. **Test each event type** - Make sure all subscription flows work

## Production Webhook Setup

When deploying to production:

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/v1/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.*`
   - `invoice.payment_*`
4. Copy the **production** webhook signing secret
5. Update your production `.env` with the production secret

## Troubleshooting

### "Webhook signature verification failed"
- Make sure you're using the webhook secret from `stripe listen` output
- Restart your API server after updating `.env`

### "No events showing up"
- Check that `stripe listen` is running
- Verify your API server is running on port 3000
- Check for errors in the webhook listener output

### "Tenant or user not found in webhook"
- The triggered events use test data
- Create a real user first with the signup endpoint
- Or modify test data to use real user IDs

## Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
