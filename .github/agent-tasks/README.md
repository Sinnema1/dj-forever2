# Agent Tasks - Phase 1

This directory contains JSON task definitions for GitHub Copilot's coding agent.

## 📋 Available Tasks

### High Priority (Start Here)

1. **T9: Request ID Tracing** (`task-T9-request-tracing.json`)

   - **Effort**: 15 minutes
   - **Why**: Foundation for debugging - adds request IDs to all logs
   - **Dependencies**: None
   - **Start First**: This is the quickest win and helps with all future tasks

2. **T1: SMTP Reliability** (`task-T1-smtp-reliability.json`)

   - **Effort**: 4 hours
   - **Why**: Makes email reminders reliable for wedding guests
   - **Dependencies**: T9 recommended (but not required)
   - **Business Value**: Highest - ensures guests get RSVP reminders

3. **T4: Lazy Loading** (`task-T4-lazy-loading.json`)
   - **Effort**: 2 hours
   - **Why**: Reduces bundle size for 99% of users (wedding guests)
   - **Dependencies**: None
   - **Performance**: Reduces main bundle from 221.8kb to <200kb

## 🚀 How to Use These Tasks

### Option 1: GitHub Issues (Recommended)

Create a new GitHub issue using the "Agent Task" template:

1. Go to https://github.com/Sinnema1/dj-forever2/issues/new/choose
2. Select "Agent Task" template
3. Copy the JSON content from the task file
4. Paste into the issue body
5. Label with `agent-task`, `phase-1`, and appropriate priority

### Option 2: Direct Implementation

If using GitHub Copilot agent directly:

1. Open the task JSON file
2. Share the full JSON with the agent
3. Agent will follow the structured plan

## 📊 Task Format

Each task JSON includes:

```json
{
  "task_id": "T9",
  "priority": "high|medium|low",
  "estimate_hours": 0.25,
  "title": "Brief description",
  "motivation": "Why this task matters",
  "touched_paths": ["files that will be modified"],
  "implementation_steps": ["ordered list of changes"],
  "tests": ["required test coverage"],
  "acceptance_criteria": ["definition of done"],
  "out_of_scope": ["what NOT to include"],
  "rollback_plan": {
    "steps": ["how to revert safely"],
    "safe_rollback": true|false
  }
}
```

## 🎯 Success Criteria

All tasks must:

- ✅ Pass CI/CD pipeline (tests, typecheck, build, size gate)
- ✅ Include tests matching the `tests` field
- ✅ Meet all `acceptance_criteria`
- ✅ Stay within `touched_paths` (no scope creep)
- ✅ Follow `AGENT_CONTRACT.md` rules

## 📈 Progress Tracking

- [ ] T9: Request ID Tracing
- [ ] T1: SMTP Reliability
- [ ] T4: Lazy Loading

Update this checklist as tasks complete.

## 🔗 Related Documentation

- [Agent Contract](../../docs/AGENT_CONTRACT.md) - Operating rules
- [Agent Tasks Evaluation](../../docs/development/AGENT_TASKS_EVALUATION.md) - Full task analysis
- [Pre-Agent Summary](../../PRE_AGENT_COMMIT_SUMMARY.md) - Infrastructure baseline

## 💡 Tips for Success

1. **Start with T9** - It's quick and helps with debugging other tasks
2. **Read the contract** - `docs/AGENT_CONTRACT.md` defines allowed operations
3. **Test locally first** - Run tests before pushing
4. **One task at a time** - Don't mix tasks in the same PR
5. **Use rollback plan** - If something breaks, follow the rollback steps

## 📧 Questions?

See the full evaluation document for context and rationale:
`docs/development/AGENT_TASKS_EVALUATION.md`
