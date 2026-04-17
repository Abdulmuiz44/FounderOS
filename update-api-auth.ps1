# Batch update all API routes to use Supabase auth instead of NextAuth
$routes = @(
    "src/app/api/insights/route.ts",
    "src/app/api/drift/route.ts",
    "src/app/api/profile/route.ts",
    "src/app/api/logs/route.ts",
    "src/app/api/subscription/route.ts",
    "src/app/api/chatter/route.ts",
    "src/app/api/github/repos/route.ts",
    "src/app/api/opportunities/generate/route.ts",
    "src/app/api/opportunities/create/route.ts",
    "src/app/api/opportunities/[id]/convert/route.ts",
    "src/app/api/opportunities/[id]/mom-test/route.ts",
    "src/app/api/opportunities/[id]/waitlist/route.ts",
    "src/app/api/opportunities/[id]/competitor-spy/route.ts"
)

foreach ($route in $routes) {
    if (Test-Path $route) {
        Write-Host "Updating $route..."
        $content = Get-Content $route -Raw
        
        # Replace imports
        $content = $content -replace "import \{ auth \} from '@/lib/auth';", "import { getServerUser } from '@/utils/supabase/auth';"
        $content = $content -replace "import \{ auth \} from '@/lib/auth'; // Import auth helper", "import { getServerUser } from '@/utils/supabase/auth';"
        
        # Replace session logic
        $content = $content -replace "const session = await auth\(\);", "const user = await getServerUser();"
        $content = $content -replace "if \(!session\?\.\user\?\.\id\)", "if (!user)"
        $content = $content -replace "if \(!session\?\.\user\)", "if (!user)"
        $content = $content -replace "session\?\.\user\?\.\id", "user.id"
        $content = $content -replace "session\.user\.id", "user.id"
        $content = $content -replace "session\.user", "user"
        
        Set-Content $route -Value $content
        Write-Host "Done: $route"
    }
}

Write-Host "`nAll routes updated successfully!"
