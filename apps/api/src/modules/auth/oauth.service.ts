/**
 * Google and GitHub OAuth. Like the OpenAI client in ../ai/client.ts, this
 * is real code against the real provider endpoints — it needs credentials
 * only you can create: register an OAuth app with each provider, then set
 * GOOGLE_CLIENT_ID/SECRET and GITHUB_CLIENT_ID/SECRET, plus
 * OAUTH_REDIRECT_BASE_URL, in your .env.
 */

const redirectBase = () => process.env.OAUTH_REDIRECT_BASE_URL ?? "http://localhost:4000";

export const googleOAuth = {
  getAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      redirect_uri: `${redirectBase()}/api/v1/auth/google/callback`,
      response_type: "code",
      scope: "openid email profile",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  async exchangeCode(code: string): Promise<{ email: string; name?: string }> {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: `${redirectBase()}/api/v1/auth/google/callback`,
        grant_type: "authorization_code",
        code,
      }),
    });
    if (!tokenRes.ok) throw new Error(`Google token exchange failed: ${await tokenRes.text()}`);
    const tokenData = await tokenRes.json();

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!profileRes.ok) throw new Error(`Google profile fetch failed: ${await profileRes.text()}`);
    const profile = await profileRes.json();

    return { email: profile.email, name: profile.name };
  },
};

export const githubOAuth = {
  getAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID ?? "",
      redirect_uri: `${redirectBase()}/api/v1/auth/github/callback`,
      scope: "read:user user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  },

  async exchangeCode(code: string): Promise<{ email: string; name?: string }> {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID ?? "",
        client_secret: process.env.GITHUB_CLIENT_SECRET ?? "",
        redirect_uri: `${redirectBase()}/api/v1/auth/github/callback`,
        code,
      }),
    });
    if (!tokenRes.ok) throw new Error(`GitHub token exchange failed: ${await tokenRes.text()}`);
    const tokenData = await tokenRes.json();

    const profileRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json" },
    });
    if (!profileRes.ok) throw new Error(`GitHub profile fetch failed: ${await profileRes.text()}`);
    const profile = await profileRes.json();

    let email: string | undefined = profile.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json" },
      });
      if (emailsRes.ok) {
        const emails: Array<{ primary: boolean; email: string }> = await emailsRes.json();
        email = emails.find((e) => e.primary)?.email ?? emails[0]?.email;
      }
    }
    if (!email) throw new Error("GitHub did not return an email address for this account.");

    return { email, name: profile.name ?? profile.login };
  },
};
