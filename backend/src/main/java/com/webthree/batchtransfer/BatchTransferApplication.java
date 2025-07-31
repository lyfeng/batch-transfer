package com.webthree.batchtransfer;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * ETH批量转账应用主启动类
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableCaching
@EnableAsync
@EnableScheduling
@MapperScan("com.webthree.batchtransfer.mapper")
public class BatchTransferApplication {

    public static void main(String[] args) {
        SpringApplication.run(BatchTransferApplication.class, args);
    }
}