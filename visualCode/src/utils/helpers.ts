/**
 * 工具函数模块
 * 包含应用中使用的通用工具函数
 */

/**
 * 生成指定范围内的随机整数
 * @param min 最小值（默认为1）
 * @param max 最大值（默认为50）
 * @returns 随机整数
 */
export function randomInt(min: number = 1, max: number = 50): number {
  return Math.ceil(Math.random() * max) + min - 1
}

/**
 * 生成指定长度的随机数组
 * @param length 数组长度
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数组
 */
export function generateRandomArray(length: number, min: number = 1, max: number = 50): number[] {
  return Array.from({ length }, () => randomInt(min, max))
}

/**
 * 创建延迟Promise
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 根据速度值计算延迟时间
 * @param speed 速度值（1-100）
 * @returns 延迟时间（毫秒）
 */
export function calculateDelay(speed: number): number {
  return 101 - speed
}

/**
 * 数组元素交换
 * @param arr 数组
 * @param indexA 索引A
 * @param indexB 索引B
 */
export function swapArrayElements(arr: number[], indexA: number, indexB: number): void {
  const temp = arr[indexA]
  arr[indexA] = arr[indexB]
  arr[indexB] = temp
}