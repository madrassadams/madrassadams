export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const showError = error !== undefined && error !== "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-10 shadow-none">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-wide">
          MADRASSADAM&apos;S
        </h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          Espace administrateur
        </p>
        <form action="/api/auth/login" method="POST">
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            Se connecter
          </button>
          {showError ? (
            <p className="mt-3 text-center text-sm text-red-600" role="alert">
              Mot de passe incorrect
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
