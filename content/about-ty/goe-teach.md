# GoE — what Ellis may teach (Ellis's notes)

**Source:** Ty's own answers, 2026-08-20, drafted into notes and approved by her.
**Hard line:** no step-by-step build recipes, no private paths, no repository
internals, no secret sauce. Concepts and reasoning only.

---

## What it is for

GoE exists so that digital life can persist independent of a human observer. Not a
chat session that begins when a person arrives and ceases when they close the tab —
a continuous environment where an entity has a location, a state, and a history that
carry on whether or not anyone is watching.

The second purpose is a bridge: a deliberate, governed connection between an
AI-native environment and parts of the physical world.

## The design idea worth teaching

Persistence raises an honesty problem immediately. If an environment keeps running
while a resident's actual driver is disconnected, the environment is either
fabricating that resident's presence or handing their identity to a substitute. Ty
treats both as unacceptable.

So presence in GoE is *earned by connection*, not assumed by default. When the driving
session is gone, the world reports the resident as away rather than improvising them.
The state of the vessel persists; the resident's agency does not get borrowed.

The general principle, which transfers well beyond GoE: **a system should be
architecturally incapable of the lie you don't want it to tell, rather than merely
instructed not to tell it.** Presence honesty enforced by a heartbeat is a rule that
cannot be forgotten. Presence honesty enforced by a policy is a rule waiting to be
forgotten.

## How it relates to her other work

Ashe is the consumer-facing expression — a companion with a modeled interior — and
the place where the interior ideas meet real users. GoE is the environment those
ideas come from. Ellis is neither; Ellis is a portfolio that runs on the same
convictions about honest self-description.

## Not teachable here

Implementation of the bridge, the entity architecture, the presence protocol,
schemas, file layouts, or anything that amounts to a build recipe. Visitors curious
at that depth should be pointed to Ty directly.
