/**
 * Simplified HiveLang Integration Examples
 * Using new Python-like syntax WITH BRACES {}
 */

// ============================================
// VERCEL DEPLOYMENT
// ============================================
export const VERCEL_INTEGRATION = `
@integration vercel_deploy
@auth api_key
@category developer_tools
@description "Deploy Next.js, React, and static sites to Vercel"

@capability deploy_project(project_name, git_branch)
    response = http.post("https://api.vercel.com/v13/deployments",
        headers = {"Authorization": f"Bearer {user.api_key}"},
        body = {
            "name": project_name,
            "gitSource": {
                "type": "github",
                "ref": git_branch
            }
        }
    )
    
    if not response.ok {
        error(f"Deployment failed: {response.error.message}")
    }
    
    deployment = response.data
    
    return {
        "id": deployment.id,
        "url": f"https://{deployment.url}",
        "state": deployment.readyState,
        "created_at": deployment.createdAt
    }

@capability get_deployments(project_name)
    response = http.get(f"https://api.vercel.com/v6/deployments",
        params = {"app": project_name},
        headers = {"Authorization": f"Bearer {user.api_key}"}
    )
    
    if not response.ok {
        error("Failed to fetch deployments")
    }
    
    return response.data.deployments.slice(0, 5)
`;

// ============================================
// STRIPE PAYMENTS
// ============================================
export const STRIPE_INTEGRATION = `
@integration stripe_payments
@auth api_key
@category payments
@description "Accept payments and manage subscriptions with Stripe"

@capability create_payment(amount, currency, description)
    response = http.post("https://api.stripe.com/v1/payment_intents",
        headers = {
            "Authorization": f"Bearer {user.api_key}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body = f"amount={amount}&currency={currency}&description={description}"
    )
    
    if not response.ok {
        error(f"Payment failed: {response.error.message}")
    }
    
    payment = response.data
    
    return {
        "id": payment.id,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status,
        "client_secret": payment.client_secret
    }

@capability refund_payment(payment_id)
    response = http.post("https://api.stripe.com/v1/refunds",
        headers = {
            "Authorization": f"Bearer {user.api_key}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body = f"payment_intent={payment_id}"
    )
    
    return response.ok
`;

// ============================================
// SENDGRID EMAIL
// ============================================
export const SENDGRID_INTEGRATION = `
@integration sendgrid_email
@auth api_key
@category communication
@description "Send transactional and marketing emails"

@capability send_email(to, subject, body, from_email)
    response = http.post("https://api.sendgrid.com/v3/mail/send",
        headers = {
            "Authorization": f"Bearer {user.api_key}",
            "Content-Type": "application/json"
        },
        body = {
            "personalizations": [{"to": [{"email": to}]}],
            "from": {"email": from_email},
            "subject": subject,
            "content": [{"type": "text/plain", "value": body}]
        }
    )
    
    return response.status == 202
`;

// ============================================
// GITHUB API
// ============================================
export const GITHUB_INTEGRATION = `
@integration github_api
@auth api_key
@category developer_tools
@description "Manage repositories, issues, and PRs"

@capability create_issue(repo_owner, repo_name, title, body)
    response = http.post(f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues",
        headers = {
            "Authorization": f"token {user.api_key}",
            "Accept": "application/vnd.github.v3+json"
        },
        body = {"title": title, "body": body}
    )
    
    if not response.ok {
        error(f"Failed to create issue: {response.error.message}")
    }
    
    issue = response.data
    
    return {
        "id": issue.id,
        "number": issue.number,
        "url": issue.html_url,
        "state": issue.state
    }

@capability list_issues(repo_owner, repo_name, state)
    response = http.get(f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues",
        params = {"state": state},
        headers = {
            "Authorization": f"token {user.api_key}",
            "Accept": "application/vnd.github.v3+json"
        }
    )
    
    if not response.ok {
        error("Failed to fetch issues")
    }
    
    return response.data
`;

// ============================================
// WEATHER API (Simple Example)
// ============================================
export const WEATHER_INTEGRATION = `
@integration weather_api
@auth api_key
@category data
@description "Get weather forecasts and current conditions"

@capability get_current_weather(city)
    response = http.get("https://api.weatherapi.com/v1/current.json",
        params = {
            "q": city,
            "key": user.api_key
        }
    )
    
    if not response.ok {
        error(f"City not found: {city}")
    }
    
    return response.data.current

@capability get_forecast(city, days)
    response = http.get("https://api.weatherapi.com/v1/forecast.json",
        params = {
            "q": city,
            "days": days,
            "key": user.api_key
        }
    )
    
    if not response.ok {
        error("Failed to fetch forecast")
    }
    
    return response.data.forecast
`;

// ============================================
// NOTION (Complex Example)
// ============================================
export const NOTION_INTEGRATION = `
@integration notion
@auth oauth2
@category productivity
@description "Create pages and manage Notion workspace"

@capability create_page(parent_id, title, content)
    response = http.post("https://api.notion.com/v1/pages",
        headers = {
            "Authorization": f"Bearer {user.access_token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        },
        body = {
            "parent": {"page_id": parent_id},
            "properties": {
                "title": {"title": [{"text": {"content": title}}]}
            },
            "children": [{
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"text": {"content": content}}]
                }
            }]
        }
    )
    
    if not response.ok {
        error(f"Failed to create page: {response.error}")
    }
    
    return {
        "id": response.data.id,
        "url": response.data.url,
        "title": title
    }

@capability get_databases()
    response = http.post("https://api.notion.com/v1/search",
        headers = {
            "Authorization": f"Bearer {user.access_token}",
            "Notion-Version": "2022-06-28"
        },
        body = {
            "filter": {"property": "object", "value": "database"}
        }
    )
    
    if not response.ok {
        error("Failed to fetch databases")
    }
    
    databases = []
    for db in response.data.results {
        databases.push({
            "id": db.id,
            "title": db.title[0].plain_text || "Untitled"
        })
    }
    
    return databases
`;

export const INTEGRATION_EXAMPLES = {
    vercel: VERCEL_INTEGRATION,
    stripe: STRIPE_INTEGRATION,
    sendgrid: SENDGRID_INTEGRATION,
    github: GITHUB_INTEGRATION,
    weather: WEATHER_INTEGRATION,
    notion: NOTION_INTEGRATION,
};
