# Privacy & Anonymity Protections

CompanyVoice is built with privacy-first principles to ensure complete anonymity for users who choose to post or comment anonymously.

## Database-Level Protections

### 1. Mandatory Null User ID for Anonymous Content
- **Check Constraints**: Database enforces that any post or comment marked as `is_anonymous=true` MUST have `user_id=NULL`
- **Cannot be bypassed**: Even application bugs cannot leak user identity due to database-level enforcement

### 2. Secure Views
- All post/comment queries use secure views that automatically filter out `user_id` for anonymous content
- Even if user_id is accidentally set (impossible due to constraint), it will never be exposed

### 3. Vote Privacy
- Users can only see their own votes, not others' votes
- Prevents tracking user behavior across posts

## Application-Level Protections

### 4. Edge Functions
- AI analysis function never logs or exposes user identity
- Only processes content, tags, and sentiment - never user_id
- Logs only indicate whether post is anonymous, never who posted it

### 5. Admin Access
- Admins cannot see who made anonymous posts/comments
- Moderation actions respect anonymity
- Hidden content maintains user privacy

## Row Level Security (RLS)

### 6. Data Access Policies
- Posts: Anyone can view, but user_id is filtered for anonymous posts
- Comments: Only non-hidden comments visible, with user_id filtered for anonymous
- Votes: Users can only see their own voting history
- Profiles: Public view access, but cannot be linked to anonymous content

## Guarantees

✅ **Anonymous posts CANNOT be traced back to users** - Enforced at database level  
✅ **No admin access to anonymous user identities** - System-wide enforcement  
✅ **Vote privacy** - No one can see who voted on what (except own votes)  
✅ **AI analysis respects anonymity** - Never processes or logs user identity  
✅ **Database constraints prevent data leaks** - Technical impossibility, not just policy

## For Users

When you post or comment anonymously:
- Your user ID is set to NULL in the database
- No one, including admins, can trace the content back to you
- Your voting behavior is private
- AI analysis never sees your identity

## For Developers

Key technical implementations:
1. Check constraints in `posts` and `comments` tables
2. Secure views: `posts_secure` and `comments_secure`
3. Filtered RLS policies on votes table
4. Edge function privacy logging
5. Admin interface respects anonymity

## Audit Trail

All privacy measures are enforced at multiple levels:
- Database constraints (cannot be bypassed)
- Secure views (automatic filtering)
- RLS policies (access control)
- Application logic (edge functions, frontend)

---

**Last Updated**: October 2025  
**Compliance**: Designed for GDPR/privacy-first operations
