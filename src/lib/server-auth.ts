import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export class ServerAuthError extends Error {
  readonly status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = 'ServerAuthError';
    this.status = status;
  }
}

export const getServerAuthContext = async (): Promise<{
  user: User;
  accessToken: string | null;
}> => {
  const supabase = await createClient();

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new ServerAuthError('Failed to load session', 500);
  }

  const session = sessionData.session;
  if (!session) {
    throw new ServerAuthError('Unauthorized', 401);
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new ServerAuthError('Unauthorized', 401);
  }

  return {
    user: userData.user,
    accessToken: session.provider_token ?? null,
  };
};

export const requireGitHubAccessToken = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  const { user, accessToken } = await getServerAuthContext();
  if (!accessToken) {
    throw new ServerAuthError('GitHub not connected', 401);
  }

  return { user, accessToken };
};
