@echo off
set /p a=<D:\test\app\mock_rule.js
echo.%a%
cd anyproxy/bin


jx --eval "console.log('test')"
jx --eval "anyproxy --rule ../app/rule_mock.js"

pause