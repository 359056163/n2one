# N2one

用于收集一小短时间内的多次事件数据，合并成一次执行;

个人使用场景：
用于处理 短信验证码 请求；
收集短时间内（1～5秒）内所有 短信请求，合并参数，然后一次性请求短信服务，降低对短信服务的请求数。