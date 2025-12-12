import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const {
            name,
            slug,
            category,
            shortDescription,
            longDescription,
            iconUrl,
            coverImageUrl,
            screenshots,
            pricingModel,
            price,
            currency,
            paystackPlanCode,
            integrationType,
            authMethod,
            apiBaseUrl,
            documentationUrl,
            capabilities,
        } = body;

        // 3. Validation
        if (!name || !slug || !shortDescription) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 4. Insert into Database
        const { data: integration, error: dbError } = await supabase
            .from('marketplace_integrations')
            .insert({
                developer_id: user.id,
                name,
                slug,
                category,
                short_description: shortDescription,
                long_description: longDescription,
                icon_url: iconUrl,
                cover_image_url: coverImageUrl,
                screenshots: screenshots || [],
                pricing_model: pricingModel,
                price: pricingModel === 'free' ? 0 : price,
                currency,
                paystack_plan_code: paystackPlanCode, // Mapped from our schema change
                integration_type: integrationType,
                auth_method: authMethod,
                capabilities: capabilities || [],
                documentation_url: documentationUrl,
                status: 'pending', // Always pending review
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, integration });

    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
