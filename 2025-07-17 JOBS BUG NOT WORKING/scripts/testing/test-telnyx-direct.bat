@echo off
echo Testing Telnyx API directly...
curl -X POST https://api.telnyx.com/v2/messages ^
-H "Authorization: Bearer KEY0197DAA8BF3E951E5527CAA98E7770FC" ^
-H "Content-Type: application/json" ^
-d "{\"from\":\"+12898192158\",\"to\":\"+14377476737\",\"text\":\"Test from direct API call\"}"