package com.webthree.batchtransfer.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import java.util.concurrent.TimeUnit;

/**
 * Web3j配置类
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@Configuration
public class Web3jConfig {
    
    @Value("${app.blockchain.rpc-url:https://mainnet.infura.io/v3/YOUR_PROJECT_ID}")
    private String rpcUrl;
    
    @Value("${app.blockchain.connection-timeout:30000}")
    private long connectionTimeout;
    
    @Value("${app.blockchain.read-timeout:60000}")
    private long readTimeout;
    
    /**
     * 创建Web3j实例
     * 
     * @return Web3j实例
     */
    @Bean
    public Web3j web3j() {
        log.info("初始化Web3j连接，RPC URL: {}", rpcUrl);
        
        try {
            // 创建HTTP服务，设置超时时间
            HttpService httpService = new HttpService(rpcUrl);
            httpService.addHeader("User-Agent", "BatchTransfer/1.0.0");
            
            // 设置连接和读取超时
            okhttp3.OkHttpClient.Builder clientBuilder = httpService.getOkHttpClientBuilder();
            clientBuilder.connectTimeout(connectionTimeout, TimeUnit.MILLISECONDS);
            clientBuilder.readTimeout(readTimeout, TimeUnit.MILLISECONDS);
            clientBuilder.writeTimeout(readTimeout, TimeUnit.MILLISECONDS);
            
            Web3j web3j = Web3j.build(httpService);
            
            // 测试连接
            try {
                String clientVersion = web3j.web3ClientVersion().send().getWeb3ClientVersion();
                log.info("Web3j连接成功，客户端版本: {}", clientVersion);
            } catch (Exception e) {
                log.warn("Web3j连接测试失败，但继续初始化: {}", e.getMessage());
            }
            
            return web3j;
            
        } catch (Exception e) {
            log.error("初始化Web3j失败", e);
            throw new RuntimeException("Web3j初始化失败", e);
        }
    }
} 