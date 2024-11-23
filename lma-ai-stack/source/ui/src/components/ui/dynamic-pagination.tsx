import React, { useCallback } from 'react';
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNextButton,
  PaginationPreviousButton,
} from './pagination';
import { PaginationProps } from '@awsui/components-react';
import { NonCancelableEventHandler } from '@awsui/components-react/internal/events';

interface IDynamicPagination {
  totalPages: number;
  currentPage: number;
  onPageChange: NonCancelableEventHandler<PaginationProps.ChangeDetail>;
}

const convertToPageObject = (page: number): any => ({
  cancelable: false,
  detail: {
    currentPageIndex: page,
  },
  defaultPrevented: false,
  cancelBubble: false,
});

const DynamicPagination = ({ totalPages, currentPage, onPageChange }: IDynamicPagination) => {
  const renderPageNumbers = useCallback(() => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const ellipsisThreshold = 2; // Pages around ellipsis

    // Calculate start and end page numbers based on current page
    let startPage: number = Math.max(1, currentPage - ellipsisThreshold);
    let endPage: number = Math.min(totalPages, currentPage + ellipsisThreshold);

    // Adjust if near the beginning or end
    if (currentPage <= ellipsisThreshold) {
      endPage = Math.min(totalPages, maxPagesToShow);
    } else if (currentPage >= totalPages - ellipsisThreshold) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    // Add ellipses for hidden ranges
    if (startPage > 1) {
      pageNumbers.push(
        <PaginationItem key="start-ellipsis">
          <PaginationButton onClick={() => onPageChange(convertToPageObject(1))}>1</PaginationButton>
        </PaginationItem>,
      );
      if (startPage > 2) {
        pageNumbers.push(
          <PaginationItem key="ellipsis-left">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    // Add page numbers in the main range
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PaginationItem key={i}>
          <PaginationButton isActive={i === currentPage} onClick={() => onPageChange(convertToPageObject(i))}>
            {i}
          </PaginationButton>
        </PaginationItem>,
      );
    }

    // Add ellipses for hidden pages at the end
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <PaginationItem key="ellipsis-right">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      pageNumbers.push(
        <PaginationItem key="end-page">
          <PaginationButton onClick={() => onPageChange(convertToPageObject(totalPages))}>{totalPages}</PaginationButton>
        </PaginationItem>,
      );
    }

    return pageNumbers;
  }, [totalPages, currentPage, onPageChange]);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPreviousButton onClick={() => onPageChange(convertToPageObject(Math.max(currentPage - 1, 1)))} disabled={currentPage === 1} />
        </PaginationItem>

        {renderPageNumbers()}

        <PaginationItem>
          <PaginationNextButton
            onClick={() => onPageChange(convertToPageObject(Math.min(currentPage + 1, totalPages)))}
            disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DynamicPagination;
