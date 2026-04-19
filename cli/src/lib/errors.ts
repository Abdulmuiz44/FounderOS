export type CliErrorCode =
  | 'INVALID_ARGUMENT'
  | 'MISSING_ARGUMENT'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INVALID_DATA'
  | 'IO_ERROR';

export class CliError extends Error {
  public readonly code: CliErrorCode;
  public readonly exitCode: number;

  constructor(code: CliErrorCode, message: string, exitCode?: number) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.exitCode = exitCode ?? defaultExitCode(code);
  }
}

const defaultExitCode = (code: CliErrorCode): number => {
  if (code === 'NOT_FOUND') {
    return 4;
  }
  if (code === 'CONFLICT') {
    return 5;
  }
  if (code === 'INVALID_ARGUMENT' || code === 'MISSING_ARGUMENT' || code === 'INVALID_DATA') {
    return 2;
  }
  return 1;
};
