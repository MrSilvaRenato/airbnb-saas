<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{{ $message->subject }}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
  .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
  .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 28px 32px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
  .header p  { color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px; }
  .body { padding: 32px; }
  .text { font-size: 14px; color: #374151; line-height: 1.75; white-space: pre-line; }
  .cta { margin: 28px 0; text-align: center; }
  .btn { display: inline-block; background: #4f46e5; color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; }
  .footer { padding: 20px 32px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
  .footer a { color: #9ca3af; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>HostFlows</h1>
    <p>Automated guest communication</p>
  </div>
  <div class="body">
    <p class="text">{{ $message->body }}</p>
    @if($message->package && $message->package->slug)
    <div class="cta">
      <a href="{{ url('/p/' . $message->package->slug) }}" class="btn">Open Welcome Guide →</a>
    </div>
    @endif
  </div>
  <div class="footer">
    Sent via <a href="https://hostflows.com.au">HostFlows</a> · Automated guest communication
  </div>
</div>
</body>
</html>
