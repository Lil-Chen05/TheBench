import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-yellow-400">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="mb-8 mt-2">
          <span className="text-4xl md:text-5xl font-black pixelated-text text-black select-none">THE BENCH</span>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <Card className="bg-white text-black shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-black">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-red-500 font-semibold bg-white border border-red-200 rounded px-2 py-1">
                  Code error: {params.error}
                </p>
              ) : (
                <p className="text-sm text-black">
                  An unspecified error occurred.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
