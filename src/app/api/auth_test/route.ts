import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Try to dynamically import the auth module
        const authModule = await import("@/lib/auth")

        return NextResponse.json({
            status: "ok",
            handlersExist: !!authModule.handlers,
            authExist: !!authModule.auth,
            handlersGET: !!authModule.handlers?.GET,
            handlersPOST: !!authModule.handlers?.POST,
        })
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: error.stack,
        }, { status: 500 })
    }
}
