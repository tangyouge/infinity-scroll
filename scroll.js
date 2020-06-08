/*
 * @Author: ZhipengTang
 * @Date: 2020-06-08 09:46:12
 * @LastEditors: ZhipengTang
 * @LastEditTime: 2020-06-08 16:29:56
 * @FilePath: /demo-scroll/scroll.js
 */ 
class Scroll {
  constructor(props) {
    this.checkProps(props);
  }

  // 对传入的属性进行检查
  checkProps(props) {
    if (!props || typeof props !== "object") {
      throw new Error('options are illegal');
    }

    // options
    const {
      firstItemId,
      lastItemId,
      itemHeight,
      container,
      listSize,
      renderFunction
    } = props;

    if (!firstItemId) {
      throw new Error('firstItemId can not be null');
    }
    if (!lastItemId) {
      throw new Error('lastItemId can not be null');
    }
    if (!itemHeight || typeof itemHeight !== 'number') {
      throw new Error('itemHeight is illegal');
    }
    if (!container || !container.nodeType) {
      throw new Error('root is illegal');
    }
    if (!listSize) {
      throw new Error('listSize is illegal');
    }
    if (!renderFunction || typeof renderFunction !== 'function') {
      throw new Error('lastItemId is illegal');
    }
    
    this.firstItemId = firstItemId;
    this.lastItemId = lastItemId;
    this.itemHeight = itemHeight;
    this.container = container;
    this.listSize = listSize;
    this.renderFunction = renderFunction;

    this.firstItem = document.getElementById(firstItemId);
    this.lastItem = document.getElementById(lastItemId);

    this.domDataCache = {
      currentPaddingTop: 0,
      currentPaddingBottom: 0,
      topSentinelPreviousY: 0,
      topSentinelPreviousRatio: 0,
      bottomSentinelPreviousY: 0,
      bottomSentinelPreviousRatio: 0,
      currentIndex: 0
    };
  }

  // 获取第一个索引值
  getWindowFirstIndex(isScrollDown) {
    const { currentIndex } = this.domDataCache;
    
    // 以全部容器内所有元素的一半作为增量
    const increment = Math.floor(this.listSize / 2);
    
    let firstIndex;
    if (isScrollDown) {
      firstIndex = currentIndex + increment;
    } else {
      firstIndex = currentIndex - increment;
    }

    if (firstIndex < 0) {
      firstIndex = 0;
    }
    return firstIndex;
  }

  updateDomDataCache(params) {
    Object.assign(this.domDataCache, params);
  }

  adjustPaddings(isScrollDown) {
    const { container, itemHeight } = this;
    const { currentPaddingTop, currentPaddingBottom } = this.domDataCache;

    let newCurrentPaddingTop, newCurrentPaddingBottom;
    const remPaddingsVal = itemHeight * (Math.floor(this.listSize / 2));

    if (isScrollDown) {
      newCurrentPaddingTop = currentPaddingTop + remPaddingsVal;
      if (currentPaddingBottom === 0) {
        newCurrentPaddingBottom = 0;
      } else {
        newCurrentPaddingBottom = currentPaddingBottom - remPaddingsVal;
      }
      console.log("3.1", newCurrentPaddingTop, newCurrentPaddingBottom);
    } else {
      newCurrentPaddingBottom = currentPaddingBottom + remPaddingsVal;
      if (currentPaddingTop === 0) {
        newCurrentPaddingTop = 0;
      } else {
        newCurrentPaddingTop = currentPaddingTop - remPaddingsVal;
      }
      console.log("3.2", newCurrentPaddingTop, newCurrentPaddingBottom);
    }

    container.style.paddingBottom = `${newCurrentPaddingBottom}px`;
    container.style.paddingTop = `${newCurrentPaddingTop}px`;

    this.updateDomDataCache({
      currentPaddingTop: newCurrentPaddingTop,
      currentPaddingBottom: newCurrentPaddingBottom
    });
  }

  // 顶部元素处理
  topItemCb(entry) {
    const {
      topSentinelPreviousY,
      topSentinelPreviousRatio
    } = this.domDataCache;

    console.log("1.1", entry);

    const currentY = entry.boundingClientRect.top;  // 0        -122
    const currentRatio = entry.intersectionRatio;   // 1        0
    const isIntersecting = entry.isIntersecting;    // true     false

    if (currentY > topSentinelPreviousY && isIntersecting && currentRatio >= topSentinelPreviousRatio) {
      const firstIndex = this.getWindowFirstIndex(false);
      this.renderFunction(firstIndex);
      this.adjustPaddings(false);
      this.updateDomDataCache({
        currentIndex: firstIndex,
        topSentinelPreviousY: currentY,
        topSentinelPreviousRatio: currentRatio
      });
      console.log("1.2.1", this.domDataCache)
    } else {
      this.updateDomDataCache({
        topSentinelPreviousY: currentY,
        topSentinelPreviousRatio: currentRatio
      });
      console.log("1.2.2", this.domDataCache)
    }
  }

  // 底部元素处理
  bottomItemCb(entry) {
    const {
      bottomSentinelPreviousY,
      bottomSentinelPreviousRatio
    } = this.domDataCache;

    console.log("2.1", entry);

    const currentY = entry.boundingClientRect.top;    // 2280       667
    const currentRatio = entry.intersectionRatio;     // 0          0
    const isIntersecting = entry.isIntersecting;      // false      true

    if (currentY < bottomSentinelPreviousY && currentRatio >= bottomSentinelPreviousRatio && isIntersecting) {
      const firstIndex = this.getWindowFirstIndex(true);
      this.renderFunction(firstIndex);
      this.adjustPaddings(true);
      this.updateDomDataCache({
          currentIndex: firstIndex,
          bottomSentinelPreviousY: currentY,
          bottomSentinelPreviousRatio: currentRatio
      });
      console.log("2.2.1", this.domDataCache)
    } else {
      this.updateDomDataCache({
        bottomSentinelPreviousY: currentY,
        bottomSentinelPreviousRatio: currentRatio
      });
      console.log("2.2.2", this.domDataCache)
    }

  }

  // 初始化
  initIntersectionObserver() {
    const options = {};

    // 观察元素开始进入视窗或者完全离开视窗的时候都会触发
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.target.id === this.firstItemId) {
          console.log("1、firstItemId")
          this.topItemCb(entry);
        } else if (entry.target.id === this.lastItemId) {
          console.log("2、lastItemId")
          this.bottomItemCb(entry);
        }
      });
    };

    this.observer = new IntersectionObserver(callback, options);
    // 观察列表第一个以及最后一个元素
    this.observer.observe(this.firstItem);
    this.observer.observe(this.lastItem);
  }

  // 开始监测
  startObserver() {
    this.initIntersectionObserver();
  }
}
