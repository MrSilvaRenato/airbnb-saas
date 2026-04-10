<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your welcome guide is ready</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
  .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
  .header { background: #111827; padding: 28px 32px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 600; }
  .header p  { color: #9ca3af; margin: 4px 0 0; font-size: 13px; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #111827; margin-bottom: 12px; }
  .text { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
  .btn { display: inline-block; background: #111827; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; }
  .details { margin-top: 28px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; font-size: 13px; color: #374151; }
  .details div { margin-bottom: 6px; }
  .details span { font-weight: 600; }
  .footer { padding: 20px 32px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  .url-fallback { word-break: break-all; color: #6b7280; font-size: 12px; margin-top: 16px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>HostFlows</h1>
    <p>Your digital welcome guide</p>
  </div>
  <div class="body">
    <p class="greeting">Hi {{ $package->guest_first_name ?? 'there' }} 👋</p>
    <p class="text">
      Your welcome guide for <strong>{{ $propertyTitle }}</strong> is ready.
      Everything you need for your stay — Wi-Fi, check-in steps, house rules, and more — is all in one place.
    </p>

    <a href="{{ $welcomeUrl }}" class="btn">Open My Welcome Guide →</a>

    <div class="details">
      <div><span>Property:</span> {{ $propertyTitle }}</div>
      @if($package->check_in_date)
      <div><span>Check-in:</span> {{ \Carbon\Carbon::parse($package->check_in_date)->format('D d M Y') }}</div>
      @endif
      @if($package->check_out_date)
      <div><span>Check-out:</span> {{ \Carbon\Carbon::parse($package->check_out_date)->format('D d M Y') }}</div>
      @endif
    </div>

    <p class="url-fallback">
      If the button doesn't work, copy this link into your browser:<br/>
      {{ $welcomeUrl }}
    </p>
  </div>
  <div class="footer">
    Sent by {{ $hostName }} via HostFlows · <a href="https://hostflows.com.au" style="color:#9ca3af;">hostflows.com.au</a>
  </div>
</div>
</body>
</html>
