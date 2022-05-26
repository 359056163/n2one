/// <reference types="node" />

/**
 * 构造函数参数option
 * 
 * cacheSize {number} 缓存的上限
 * waiting {number} 等待时间
 * worker(arr: Array<any>): Promise<void>; 处理缓存的方法
 * onError(err:any): Promise<void>; 异常处理
 */
export interface CollectorOption {
  cacheSize: number;
  waiting: number; 
  worker(arr: Array<any>): Promise<void>;
  onError(err:any): Promise<void>;
}

export class Collector<T> {
  private group : Array<T>;
  private isBusy : boolean;
  private interval: NodeJS.Timeout | null;
  private cacheSize: number = 0;
  private worker: (arr: Array<any>)=>Promise<void>;
  private waiting: number;
  private onError: (err:any)=> Promise<void>;
  constructor(opt: CollectorOption){
    this.group = [];
    this.isBusy = false;
    this.interval = null;
    this.worker = opt.worker;
    this.waiting = opt.waiting;
    this.cacheSize = opt.cacheSize;
    this.onError = opt.onError;
  }

  /**
   * collect 
   * 收集任务参数
   */
  public async collect(t: T) : Promise<void> {
    if (this.interval !== null) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    this.group.push(t);
    if (!this.isBusy) {
      if (this.group.length >= this.cacheSize) {
        await this.execute()
      } else {
        this.interval = setTimeout(async () => {
          await this.execute();
        }, this.waiting);
      }

    }
  }
  /**
   * execute 
   * 执行任务，清除缓存；
   */
  private async execute(): Promise<void>{
    this.isBusy = true;
    try {
      const list = this.group;
      this.group = [];
      await this.worker(list);
    } catch(e) {
      await this.onError(e);
    } finally {
      if (this.group.length > 0) { //检查 集合中是否还有在等待发送的 任务
          await this.execute();
      } else {
        this.isBusy = false;
      }
    }
  }
}