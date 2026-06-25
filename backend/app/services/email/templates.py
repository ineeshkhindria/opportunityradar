from datetime import datetime


class DigestEmailTemplate:
    @staticmethod
    def render(
        opportunities: list[dict],
        profile_name: str,
        frontend_url: str,
        unsubscribe_token: str,
    ) -> str:
        cards_html = "\n".join(
            DigestEmailTemplate._card_html(opp, i) for i, opp in enumerate(opportunities)
        )

        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 24px 16px; }}
        .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; padding: 32px; text-align: center; color: white; margin-bottom: 24px; }}
        .header h1 {{ margin: 0; font-size: 24px; }}
        .header p {{ margin: 8px 0 0; opacity: 0.9; font-size: 16px; }}
        .card {{ background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }}
        .card-header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }}
        .card-title {{ font-size: 18px; font-weight: 600; color: #111827; margin: 0; }}
        .card-company {{ font-size: 14px; color: #6366f1; font-weight: 500; margin: 2px 0; }}
        .card-meta {{ display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }}
        .tag {{ background: #f3f4f6; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #374151; }}
        .score {{ display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; font-weight: 700; font-size: 14px; color: white; flex-shrink: 0; }}
        .score-high {{ background: #10b981; }}
        .score-med {{ background: #f59e0b; }}
        .score-low {{ background: #ef4444; }}
        .reason {{ font-size: 14px; color: #4b5563; line-height: 1.5; padding: 12px; background: #f9fafb; border-radius: 8px; margin: 12px 0; }}
        .btn {{ display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; }}
        .footer {{ text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }}
        .unsubscribe {{ color: #9ca3af; text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Your Weekly Internship Matches</h1>
            <p>Curated just for you, {profile_name}</p>
        </div>

        {cards_html}

        <div style="text-align: center; margin: 32px 0;">
            <a href="{frontend_url}/opportunities" class="btn">View All Opportunities</a>
        </div>

        <div class="footer">
            <p>OpportunityRadar — Smart internship discovery for students</p>
            <p>
                <a href="{frontend_url}/unsubscribe?token={unsubscribe_token}" class="unsubscribe">
                    Unsubscribe from weekly digests
                </a>
            </p>
        </div>
    </div>
</body>
</html>"""

    @staticmethod
    def _card_html(opp: dict, index: int) -> str:
        score = opp.get("score", 0)
        if score >= 75:
            score_class = "score-high"
        elif score >= 50:
            score_class = "score-med"
        else:
            score_class = "score-low"

        skills = opp.get("skills_required", [])
        skills_html = "".join(f'<span class="tag">{s}</span>' for s in skills[:4])

        return f"""
        <div class="card">
            <div class="card-header">
                <div>
                    <h2 class="card-title">{opp.get("title", "Internship")}</h2>
                    <p class="card-company">{opp.get("company", "")}</p>
                </div>
                <div class="score {score_class}">{score}</div>
            </div>
            <div class="card-meta">
                <span class="tag">📍 {opp.get("location", "Remote")}</span>
                <span class="tag">💰 {opp.get("stipend", "Unpaid")}</span>
                <span class="tag">🏢 {opp.get("work_mode", "Remote")}</span>
                {skills_html}
            </div>
            <div class="reason">{opp.get("reason", "")}</div>
            <a href="{opp.get("source_url", "#")}" class="btn" target="_blank">Apply Now</a>
        </div>"""
