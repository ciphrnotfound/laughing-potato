-- Add hivelang_code column to integrations table
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS hivelang_code TEXT;

-- Add comment
COMMENT ON COLUMN integrations.hivelang_code IS 'HiveLang code for developer-created integrations';

-- Create function to increment integration usage
CREATE OR REPLACE FUNCTION increment_integration_usage(integration_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE integrations
  SET usage_count = COALESCE(usage_count, 0) + 1,
      updated_at = NOW()
  WHERE id = integration_id;
END;
$$ LANGUAGE plpgsql;

-- Example HiveLang integration
-- This shows what gets stored in hivelang_code column
/*
@integration vercel_deploy
@auth api_key
@description "Deploy projects to Vercel"

@capability deploy_project
@params project_name, git_branch
@returns object

function deploy_project(project_name, git_branch):
    response = http.post("https://api.vercel.com/v13/deployments", {
        headers: {
            "Authorization": f"Bearer {user.credentials.api_key}",
            "Content-Type": "application/json"
        },
        body: {
            "name": project_name,
            "gitSource": {
                "type": "github",
                "ref": git_branch
            }
        }
    })
    
    if response.status != 200:
        throw Error(f"Deployment failed: {response.data.error}")
    
    deployment = response.json()
    
    return {
        "id": deployment.id,
        "url": f"https://{deployment.url}",
        "state": deployment.readyState,
        "created_at": deployment.createdAt
    }
*/
