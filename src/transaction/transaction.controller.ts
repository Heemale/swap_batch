import {Body, Controller, Post} from '@nestjs/common';
import {TransactionService} from './transaction.service';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {CollectBatchDto} from './dto/collect/batch/collect-batch.dto';
import {TransactionCollectService} from "./transaction-collect.service";
import {TransactionSubsidyService} from "./transaction-subsidy.service";
import {TransactionApproveService} from "./transaction-approve.service";
import {ApproveAdminBatchDto} from "./dto/approve/batch/approve-admin-batch.dto";
import {SubsidyApproveBatchDto} from "./dto/subsidy/batch/subsidy-approve-batch.dto";
import {SubsidySwapBatchDto} from "./dto/subsidy/batch/subsidy-swap-batch.dto";

@ApiTags('交易')
@Controller('transaction')
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService,
        private readonly transactionSubsidyService: TransactionSubsidyService,
        private readonly transactionApproveService: TransactionApproveService,
        private readonly transactionCollectService: TransactionCollectService,
    ) {
    }


    @ApiOperation({summary: '批量授权（总号）'})
    @Post('/approve/admin/batch')
    async approve_admin_batch(@Body() approveAdminBatchDto: ApproveAdminBatchDto): Promise<string> {
        return await this.transactionApproveService.approve_admin_batch(approveAdminBatchDto);
    }


    @ApiOperation({summary: '创建空投gas订单 + 后台创建授权订单'})
    @Post('/subsidy/approve/batch')
    async subsidy_approve_batch(@Body() subsidyApproveBatchDto: SubsidyApproveBatchDto): Promise<string> {
        return await this.transactionSubsidyService.create_subsidy_approve_order(subsidyApproveBatchDto);
    }


    @ApiOperation({summary: '创建空投token订单 + 后台创建swap订单'})
    @Post('/subsidy/swap/batch')
    async subsidy_swap_batch(@Body() subsidySwapBatchDto: SubsidySwapBatchDto): Promise<string> {
        return await this.transactionSubsidyService.create_subsidy_swap_order(subsidySwapBatchDto);
    }


    @ApiOperation({summary: '创建归集订单'})
    @Post('/collect/batch')
    async collect_batch(@Body() collectBatchDto: CollectBatchDto): Promise<string> {
        return await this.transactionCollectService.create_collect_order(collectBatchDto);
    }


    // TODO 手动授权

    // TODO 手动创建swap订单
    // @ApiOperation({summary: '手动创建swap订单'})
    // @Post('/swap')
    // async create_swap_order(@Body() swapBatchDto: SwapBatchDto): Promise<string> {
    //     return await this.transactionService.create_swap_order(swapBatchDto);
    // }


}
