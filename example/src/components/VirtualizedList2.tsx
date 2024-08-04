import React, { useRef, useState, useEffect } from 'react';

// Component chính
const VirtualizedList = ({ items, itemHeight, renderItem }:any) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = containerRef.current?.scrollTop || 0;
      const clientHeight = containerRef.current?.clientHeight || 0;

      const newStartIndex = Math.max(
        0,
        Math.floor(scrollTop / itemHeight)
      );
      const newEndIndex = Math.min(
        items.length - 1,
        Math.floor((scrollTop + clientHeight) / itemHeight)
      );

      console.log("scrollTop",scrollTop);
      console.log("clientHeight",clientHeight);
      console.log("itemHeight",itemHeight);
      console.log("newStartIndex",newStartIndex);
      console.log("newEndIndex",newEndIndex);
      setStartIndex(newStartIndex);
      setEndIndex(newEndIndex);
    };

    handleScroll(); // Khởi tạo lần đầu

    const refCurrent = containerRef.current;
    refCurrent?.addEventListener('scroll', handleScroll);

    return () => {
      refCurrent?.removeEventListener('scroll', handleScroll);
    };
  }, [items, itemHeight]);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      style={{
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ marginTop: offsetY }}>
          {visibleItems.map((item: any) => (
            <div
              key={item.id}
              style={{
                height: itemHeight,
                boxSizing: 'border-box', // Đảm bảo kích thước đúng với chiều cao đặt ra
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sử dụng component
const AppTest2 = () => {

  const [items, setItems] = useState(
    Array.from({ length: 1000 }, (_, index) => ({
      id: index,
      content: `Item ${index + 1}`,
    }))
  );
  const renderItem = (item:any) => (
    <div style={{ border: '1px solid black', padding: '10px' }}>
      {item.content}
    </div>
  );

  const loadMoreItems = () => {
    // Giả lập tải thêm dữ liệu
    const newItems = Array.from({ length: 100 }, (_, index) => ({
      id: items.length + index,
      content: `Item ${items.length + index + 1}`,
    }));
    setItems((prevItems) => [...prevItems, ...newItems]);
  };

  return (
    <div style={{ height: '500px' }}>
      <VirtualizedList
        items={items}
        itemHeight={50}
        renderItem={renderItem}
        loadMoreItems={loadMoreItems}
      />
    </div>
  );
};

export default AppTest2;
