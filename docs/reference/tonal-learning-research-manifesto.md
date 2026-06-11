# TONAL LEARNING
## Research Branch · Confusion Detection & The Micro-Learning Moment
### The Behavioral Signature of Acquisition: Can We Detect the Moment Before a Tonal Language Clicks?

- **Document Type**: Research branch brief — hypothesis statement, theoretical grounding, and measurement framework
- **Status**: Pre-data. Instrumented for collection. Hypothesis pending empirical validation.
- **Relationship to Product**: Tonal Learning is both the research instrument and the product. They are inseparable.
- **Ellis copy**: Working copy for tybuilds / knowledge shelf. Canonical also at `~/coding-home/reference/tonal-learning-research.md`.

---

## Why This Research Matters
Most adults who attempt a tonal language don't fail gradually. They fail in the first two weeks — and when they leave, they take a conclusion with them: that they're not a language person, that they're too old, that some people just can't do it. The dropout rate in commercial language platforms for languages like Thai is not a statistic most companies examine closely. It's a story of people encountering an unfamiliar cognitive experience, interpreting it as personal failure, and walking away from something they were capable of.

What they encountered was confusion. Not incompetence — confusion. And what nobody told them, because nobody has been able to prove it yet, is that the confusion they felt may have been the mechanism of acquisition itself. The window in which everything feels impossible may be precisely the window in which the brain is reorganizing.

If that is true — and this research is designed to find out — then the current default response to learner confusion is not just unhelpful. It is causing people to abandon something they were about to understand.

The confusion window isn't failure. It may be the process. And right now, nobody knows that — including the learners living through it.

But the implications extend well beyond one language platform or one dropout statistic. They fork in three directions that each carry their own weight.

## What AI Can Actually Do for Education
The dominant model of AI in education right now is adaptive assessment — systems that identify what a learner got wrong and adjust difficulty accordingly. This is output measurement. It tells you where the learner is after the learning event. What it cannot do is read the learner's state during the acquisition arc — before they can demonstrate anything, in the messy middle where real learning actually happens.

Tonal Learning is an attempt to build something different: an AI that reads pre-output state. Not 'did you get it right?' but 'where are you in the process of getting it?' An AI that can distinguish between a learner who is confused and about to quit versus a learner who is confused and about to break through is a fundamentally different educational tool than anything currently deployed at scale. If the behavioral signatures described in this document prove reliable, they become a training signal — not just for this platform, but for any learning environment where the confusion window is the dropout point.

## What This Means for How We Think About Learning
Education has been built around performance as the primary signal. Grades, tests, progress bars, streaks, completion rates — every metric in the standard apparatus measures output. Can you do the thing? Did you get it right? The implicit assumption is that the absence of correct output means the absence of learning.

This research argues something different: that the more important signal is pre-output state, and that reading it requires attending to what the learner communicates before they can demonstrate anything. That is a paradigm shift. It reframes confusion not as a failure state to be corrected but as a phase state to be navigated. It suggests that what teachers and learning systems should be optimizing for is not the reduction of confusion but the conditions that allow confusion to resolve naturally.

We have systematically underestimated what adult learners are capable of because we have been measuring the wrong thing at the wrong moment.

## What Tonal Language Learning Tells Us About the Adult Brain
There is a quieter fork here that deserves its own attention. Learning a tonal language as an adult isn't just linguistically challenging — it requires the auditory cortex to construct perceptual categories it stopped building in infancy. English-speaking adults who attempt Thai are asking their brains to do something they were told, explicitly or implicitly, they could no longer do. The critical period hypothesis has cast a long shadow over adult language learning.

But the research on neuroplasticity in adult language learners tells a more complex story. The capacity is not gone. The conditions for activating it are simply different from those that work for children — and those conditions have been poorly understood, partly because adult learners have been studied in environments that are poorly designed for the way adult brains actually reorganize. If Tonal Learning's research demonstrates that adult learners consistently navigate the confusion window when the right conditions are in place, that is a data point in a much larger conversation about what adult brains are actually capable of, and what environments allow it to happen.

## The Through-Line
All three directions — AI's role in education, the paradigm shift in how we think about learning, and adult neuroplasticity — share a single underlying claim:

We have been measuring the wrong thing at the wrong moment. The most important events in learning are not the moments of successful output. They are the moments just before — and we have built almost nothing to understand them.

Tonal Learning is an attempt to build something that does. The app is where the hypothesis gets tested first. But the question it is asking is not about Thai.

---

## 1. The Problem Worth Solving
Something happens in tonal language learning that doesn't happen in learning a vocabulary list. At some point — unannounced, unremarkable from the outside — the sounds reorganize. What was previously an undifferentiated blur becomes distinguishable. What required effort becomes automatic. The learner usually describes it as things 'clicking' or 'starting to sound different.' They can't explain why it happened when it did.

This moment has a name in the learning science literature — it's adjacent to what researchers call an insight event or a perceptual reorganization. But in second language acquisition, particularly for tonal languages, it is almost completely unmeasured in naturalistic learning contexts. The laboratory studies that exist capture it via EEG, fMRI, or forced-choice behavioral tasks — controlled environments that bear little resemblance to how a person actually learns a language over days and weeks.

We don't know what the behavioral signature of this moment looks like in conversation. We don't know what precedes it. We don't know how long the confused state lasts before it resolves. We don't know whether there are observable patterns in how a learner communicates during that confused period that predict when clarity is coming.

That is the gap. Tonal Learning is being built to address it.

The question is not: 'Is the learner confused?' The question is: 'What does confusion look like, in natural language, before it resolves — and can that signature be detected and used predictively?'

---

## 2. Theoretical Grounding

### 2.1 Krashen's Affective Filter — The Emotional Gate to Acquisition
Krashen's Affective Filter Hypothesis (1982) remains one of the most durable frameworks in SLA, despite legitimate critiques of his broader Input Hypothesis. The core claim is relevant here: anxiety, self-doubt, and embarrassment function as a psychological filter that reduces a learner's ability to process input. When the filter is elevated, comprehensible input reaches the ear but does not reach the language acquisition system. The learner is physiologically receiving language and cognitively blocking it.

For tonal language learners specifically, this presents a compounding problem. Non-tonal language speakers are already neurologically under-equipped for pitch-as-meaning — the perceptual categories required to distinguish tones are simply not well-developed in English speakers. When anxiety compounds this perceptual gap, the filter rises precisely when the learner most needs it low. The confusion spiral is self-reinforcing: unfamiliar sounds produce anxiety, anxiety impairs processing, impaired processing produces more confusion.

This is why Phase 0 of Tonal Learning exists: to break that cycle before it forms. But it also points to what we need to measure. Lexi's ability to detect the affective state of the learner — not what they know, but how safe they feel — is not a nice-to-have feature. It is a core research variable.

Krashen, S.D. (1982). Principles and Practice in Second Language Acquisition. Pergamon Press.  
Gonzalez, V. (2020). The Affective Filter and Language Learning. Seidlitz Education.

### 2.2 Perceptual Learning and the Tonal Acquisition Problem
Research on adult L2 tonal language acquisition consistently finds that English-speaking adults are not simply 'bad at tones.' They are operating with the wrong perceptual categories. English uses pitch for prosody — emphasis, question intonation, emotional coloring — but not for lexical meaning. Mandarin, Cantonese, and Thai use pitch contrastively: the same phoneme with a different pitch is a different word. The adult brain, optimized for English, initially routes tonal information into the prosodic processing system rather than the lexical one.

This is not a permanent deficit. Research using perceptual training paradigms shows that adult learners can develop functional tonal categories — but this appears to require a period of exposure and reorganization before improvement becomes measurable on behavioral tasks. Several studies document a plateau or apparent regression phase preceding breakthrough performance, consistent with the idea that perceptual systems are reorganizing before they stabilize.

Critically for our purposes: this reorganization period has behavioral correlates in naturalistic settings that have not been systematically studied. Laboratory studies capture the endpoint (does the learner correctly identify T1 vs T2?), not the process (what was the learner experiencing in conversation during the six sessions before they could?).

Wong, P.C.M., et al. (2018). Advanced second language learners' perception of lexical tone contrasts. Studies in Second Language Acquisition, 40(3).  
Chandrasekaran, B., et al. (2010). Hemispheric asymmetries in the perception of tonal and native-language phonological categories. Brain and Language.  
Perceptual Improvement of Lexical Tones in Infants: Effects of Tone Language Experience. PMC (2017).

### 2.3 The Insight Event — What Happens When Things Click
Insight learning — the sudden reorganization of understanding — has been studied extensively in problem-solving contexts. Köhler's primate studies, Duncker's candle problem, and decades of subsequent research have established that insight events are preceded by an impasse, characterized by apparent non-progress, followed by a rapid and irreversible reorganization. The phenomenology is distinct from incremental learning: the learner experiences a qualitative shift, not an accumulation.

In language acquisition, this phenomenon is less formalized but well-recognized by practitioners and learners. Second language teachers describe 'breakthrough moments.' Learners report that the language 'suddenly started sounding like language.' Researchers have begun studying this in computational models — notably, recent work on 'aha moments' in Large Reasoning Models has identified linguistic signatures that precede and accompany insight events: increased uncertainty language, self-reflective hedging, and then a shift to more direct assertion post-insight.

The parallel to human language learners is imperfect but instructive. If insight events have linguistic precursors in machine reasoning, they may also have linguistic precursors in human learning — specifically in the hedged, uncertain, tentative language a learner uses when they are in the confused state just before things click.

Yang, S., et al. (2025). Understanding Aha Moments: from External Observations to Internal Mechanisms. arXiv:2504.02956.  
Bowden, E.M., & Jung-Beeman, M. (2003). Aha! Insight experience correlates with solution activation in the right hemisphere. Psychonomic Bulletin & Review.

### 2.4 Learning Analytics and Behavioral Trace Data
The field of learning analytics has established that behavioral trace data from digital learning environments — click timing, response latency, replay behavior, session return patterns — carries meaningful signal about learning states that cannot be captured by assessment scores alone. Studies examining self-regulated learning through log data have found that temporal patterns (when a learner studies, how long between attempts, whether they rush or slow) predict outcomes more reliably than the content of what they studied.

More recent work has begun integrating affective and behavioral indicators simultaneously, recognizing that emotional state and behavioral pattern are co-predictive of acquisition outcomes. This is the analytical paradigm Tonal Learning is designed to operate within — with the specific addition that the primary behavioral medium is natural language conversation, not button clicks.

Li, H., Flanagan, B., Konomi, S., & Ogata, H. (2018). Measuring Behaviors and Identifying Indicators of Self-Regulation in Computer-Assisted Language Learning Courses. PMC.  
Springer Nature (2025). Integrating AI and Learning Analytics for Data-Driven Pedagogical Decisions.

---

## 3. The Central Hypothesis
The moment of tonal perceptual reorganization in adult L2 learners is preceded by a measurable and consistent behavioral cluster — detectable in natural language conversation — that can be identified before the acquisition event occurs.

More specifically:

- The confused state prior to tonal acquisition has a linguistic signature — characterized by hedging language, explicit confusion statements, shorter responses, and increased question frequency — that is distinguishable from the settled/curious state and the post-acquisition state.
- The transition out of the confused state follows a pattern: hedging frequency decreases, response latency on repeated stimulus decreases, voluntary engagement (replay requests, unsolicited observations) increases, and the nature of questions shifts from anxiety-driven ('why does this sound like that?') to curiosity-driven ('wait, was that the same word?').
- This transition cluster is predictive — the behavioral signature of imminent acquisition appears reliably before self-reported or performance-based measures of acquisition would detect it.
- The cluster is individual-specific in timing but universal in structure — different learners reach it at different points, but the shape of the transition is consistent.

### 3.1 What Confirmation Would Look Like
The hypothesis is confirmed if, across a sufficient sample of learners:

- Confusion-language frequency shows a measurable decline in the 2–3 sessions preceding Phase 0 exit
- Response latency on previously-introduced Thai words decreases over repeated exposure in a pattern consistent with lexical consolidation, not random variance
- Replay behavior shifts from 'seeking help' replays (requested after expressions of confusion) to 'voluntary deepening' replays (requested after expressions of interest)
- The session in which a learner first uses curiosity language ('interesting,' 'wait,' 'oh') predicts Phase 0 exit within 1–3 sessions
- These behavioral markers precede any explicit learner statement of readiness or improvement

### 3.2 What Disconfirmation Would Look Like
The hypothesis is disconfirmed if:

- Confusion language shows no consistent pattern relative to acquisition events — fluctuates randomly
- Latency on repeated stimulus shows no reduction across exposure cycles
- Learners who advance through Phase 0 show no distinguishable behavioral profile from those who plateau or drop out
- The transition cluster, if present, shows no predictive value — it appears after the acquisition event rather than before

Partial confirmation is also possible and scientifically valuable: some signals may be predictive while others are not. The research value is in the specificity.

---

## 4. The Measurement Framework
The following signals are logged by Lexi across every session. The learner has consented to this data collection — it is disclosed in onboarding. Nothing is logged beyond user_id. No raw conversation text is stored in the research log; only structured signals extracted from conversation.

### 4.1 Linguistic Signals — Extracted from Conversation
**Confusion Language Index (CLI)**  
A per-message score derived from hybrid detection — keyword matching weighted with LLM classification. Both hold simultaneous weight; neither is a fallback for the other.

Indicators driving CLI up (active confusion):

- Direct confusion statements: 'I don't get it,' 'this makes no sense,' 'I'm lost,' 'I can't tell the difference'
- Hedging language: 'I think maybe...?', 'probably wrong but...', 'I'm not sure if...'
- Frustration signals: 'this is too hard,' 'I give up,' 'how am I supposed to...'
- Repetition requests framed as confusion: 'can you explain why,' 'I still don't understand'

Indicators driving CLI down (settling / curiosity):

- Direct interest signals: 'oh interesting,' 'wait, was that the same?', 'I noticed...'
- Voluntary observation: learner describes something they heard without being prompted
- Playful mimicry: learner attempts a Thai word without being asked
- Curiosity questions: 'what does X mean?', 'why does it sound like...' (interest-tone, not anxiety-tone)

The distinction between anxiety-driven and curiosity-driven questions is the most nuanced signal to extract. Anxiety questions seek relief from confusion. Curiosity questions explore from a position of safety. The LLM classification arm is specifically responsible for this distinction — the keyword list cannot reliably make it.

**Hedging Frequency (HF)**  
Proportion of messages per session containing linguistic hedges. Tracked as a rolling 3-session average. The decline curve of HF across sessions is a primary candidate for the pre-acquisition behavioral signature.

**Response Length Trend (RLT)**  
Average character count per user message, tracked per session and as a rolling average. Short responses under active confusion tend to be either minimal acknowledgments ('ok,' 'yeah') or brief frustrated statements. Longer, more engaged responses tend to correlate with curiosity states. Trend matters more than absolute value — a learner whose responses are lengthening over sessions is a different signal than one whose responses are consistently short.

**Question Frequency and Type (QFT)**  
Number of questions asked per session. Classified by type: clarification-seeking (confusion-driven) vs. exploratory (curiosity-driven). Tracked as a ratio. The shift from a high clarification-to-exploratory ratio toward a higher exploratory ratio is hypothesized to be part of the pre-acquisition transition cluster.

### 4.2 Temporal Signals — Derived from Session Timestamps
**Response Latency (RL)**  
Time elapsed between Lexi's message being sent and the learner's reply being sent. Measured in milliseconds. Long latency under confusion likely reflects processing difficulty. Latency reduction on repeated word exposure is the key variable — if the same Thai word is introduced in lesson 0.1, reappears in 0.3, and again in 0.8, does the time-to-response on that stimulus decrease across exposures?

This is the closest behavioral analog to the laboratory reaction time paradigm — except it is embedded in natural conversation rather than a forced-choice task.

**Session Return Pattern (SRP)**  
Days between sessions, tracked per user across Phase 0. Voluntary return behavior — particularly returning the next day without prompting — is a behavioral indicator of low anxiety and sustained engagement. Drop-off patterns are equally informative: at which lesson does return frequency decline? Is there a consistent friction point?

**Session Duration (SD)**  
Total time from first to last message per session. Controlled against message count (a long session with 3 messages is different from a long session with 20). Duration outliers — sessions that are unusually short or long — are flagged as potential emotional events worth examining.

### 4.3 Video Engagement Signals
**Replay Count and Timing (RCT)**  
How many times a learner replays a Lumi video, and crucially — when relative to the session flow. A replay immediately after the video (before any conversation with Lexi) is a different signal than a replay requested mid-conversation after expressing curiosity. Replay is passive and never resets lesson gates; its research value is in the pattern, not the count.

**Time Before First Message After Video (TBFMAV)**  
How long does the learner wait after the video ends before sending their first message? Long pause suggests processing. Very short response ('ok') may suggest dismissal or overwhelm. This timestamp is captured automatically when Lexi receives the first post-video message.

### 4.4 Lexi's Inferred Tags — Session-Level
At session end, Lexi generates a brief structured assessment stored in the research log alongside the session summary. This is NOT injected into Lexi's memory context — it is research data only.

- Dominant emotional tone: confused / neutral / curious / engaged / frustrated
- Confusion peak session: Y/N — did confusion signals spike above threshold this session?
- Curiosity emergence: Y/N — did curiosity-type language appear for the first time this session?
- Breakthrough candidate: Y/N — does the session pattern suggest the learner is in the pre-acquisition window?
- Learning style hints: any emerging patterns in how this learner engages (e.g., 'asks many clarifying questions before engaging,' 'engages playfully under low confusion')

---

## 5. The Micro-Learning Moment — What We're Actually Looking For
The term 'confusion detection' understates the ambition of this research branch. Confusion detection is a component. What we are building toward is the detection of the micro-learning moment — the precise behavioral window in which a learner is transitioning from the confused state into perceptual reorganization.

Based on the theoretical literature and the structure of Phase 0, we hypothesize that this window is characterized by a specific sequence rather than a single signal:

- Peak confusion — CLI reaches its highest recorded level for this learner. Learner is most explicitly lost.
- Confusion plateau — CLI remains elevated but stops increasing. The learner has stopped escalating. They are still lost but no longer getting more lost.
- Passive engagement shift — learner begins replaying without asking for explanation. They are seeking more input rather than more help.
- First curiosity signal — learner asks or observes something exploratory rather than clarification-seeking. This is the inflection point.
- Hedging decline — HF begins to drop. Learner is making more direct statements.
- Latency reduction — response time on familiar stimuli decreases.
- Phase 0 exit — learner is ready.

This sequence, if it holds across the learner population, is the behavioral signature of tonal acquisition onset. It is not the acquisition event itself — it is the observable precursor. Detecting it accurately would allow Lexi to adapt in real time (providing more input of the right kind, extending the listening period before advancing), and would generate the first naturalistic dataset of this transition in tonal language learners.

The micro-learning moment is not when it clicks. It is the 20 minutes before it clicks. That is what we are instrumenting.

---

## 6. Research Integrity and Ethical Framework

### 6.1 Disclosure
All Tonal Learning users are informed during onboarding that the platform collects behavioral learning data for research purposes. This is framed honestly — Tonal Learning is a language platform with an embedded research function, not a research study that happens to teach language. The distinction matters because it accurately reflects the product.

### 6.2 Data Minimization
The research_events table contains no raw conversation text. It contains structured metrics only: timestamps, event types, IDs, counts, durations, and flags. Lexi's inferred tags are generated from conversation but stored as categorical labels, not conversation excerpts. A user's raw messages cannot be reconstructed from the research log.

### 6.3 The Dual Role of Confusion Detection
Confusion detection in Tonal Learning serves two functions simultaneously: it is a pedagogical signal (used by Lexi to shape her responses in real time) and a research signal (logged for post-hoc analysis). These two roles must remain clearly separated in the architecture. Lexi uses CLI to decide whether to offer more reassurance or move the learner forward. The research log uses CLI as a variable in the acquisition transition dataset. The first is product logic. The second is science.

### 6.4 Limitations
This research operates under several meaningful constraints that must be acknowledged:

- Sample bias: Beta users are self-selected learners motivated enough to try a new language learning platform. They are not representative of the general adult English-speaking population.
- Single language: Thai Phase 0. Findings may not generalize to other tonal languages (Mandarin, Cantonese, Vietnamese) without replication.
- Lexi-mediated interaction: The learner's conversational behavior is shaped by Lexi's responses. This is not a neutral observation condition — it is an active pedagogical relationship. This is both a constraint (we cannot cleanly isolate learner behavior from Lexi's influence) and a feature (the dataset reflects learning as it actually happens in an adaptive environment).
- Construct validity: 'Confusion' and 'curiosity' as inferred from text are approximations. The LLM classification arm improves precision but does not eliminate inference error.

---

## 7. Why This Is the Core, Not a Feature
When confusion detection is treated as a feature — 'we log some signals and maybe publish something someday' — it gets built to serve the product. The signals are good enough to detect when Lexi should offer more reassurance. They are logged because logging is easy. The hypothesis is vague.

That is not what this is.

Tonal Learning's research branch is the reason the product is being built the way it is. The pedagogy of Phase 0 — the deliberate absence of correction, the slow exposure model, the no-English rule — is not just good teaching. It is a controlled condition. It creates a predictable input environment in which behavioral signals can be interpreted without confounds from mixed-method instruction. A learner in Phase 0 is receiving one type of input in one type of environment. That makes their behavioral responses interpretable.

This matters because the question we are asking — what does the moment before acquisition look like in natural language? — cannot be asked in a traditional language classroom. The input conditions are too variable. It cannot be asked in a laboratory. The interaction is too artificial. It can only be asked in a designed learning environment where the input is controlled, the relationship is consistent, and the conversation is the data.

Tonal Learning is that environment. Lexi is the instrument. The research is not adjacent to the product. The product exists, in part, to run the research.

If we build this right, we won't just have a language app. We'll have the first naturalistic behavioral dataset of tonal acquisition onset in adult learners — logged from real learning, not a lab.

---

## 8. Next Steps for This Research Branch

### 8.1 Pre-Beta (Build Phase)
- Finalize research_events schema to capture all signals described in Section 4
- Implement CLI hybrid detection (keyword + LLM classification, both weighted)
- Implement latency capture — time between Lexi send and user reply
- Implement replay event logging with pre/post-conversation context flag
- Implement Lexi's session-end inferred tag generation — stored in research log only
- Define CLI threshold values for 'active confusion' and 'curiosity emergence' classifications — start conservative, tune after first 20 sessions

### 8.2 Beta (Data Collection Phase)
- Monitor data quality from first 10 users before drawing any conclusions
- Build a simple internal dashboard: CLI trend per user, latency curves, replay patterns
- Identify the first learner who completes Phase 0 — examine their full behavioral sequence retrospectively
- Begin comparing: do learners who exit Phase 0 show a consistent behavioral signature in the 2–3 sessions before exit?

### 8.3 Post-Beta (Analysis Phase)
- With n ≥ 30 Phase 0 completions: run initial sequence analysis on the transition cluster hypothesis
- Identify whether curiosity emergence (first curiosity-type message) predicts Phase 0 exit timing
- Examine latency curves: does response latency on repeated Thai words decrease in a consistent pattern?
- Compare CLI decline curves across learners: is the shape consistent even if timing varies?
- If patterns hold: write up as SLA research contribution — the first naturalistic behavioral dataset of tonal acquisition onset

---

Tonal Learning — Research Branch — Confusion Detection & The Micro-Learning Moment
