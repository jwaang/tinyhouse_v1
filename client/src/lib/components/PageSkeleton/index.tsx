import React, { Fragment } from 'react';
import { Skeleton } from 'antd';

export const PageSkeleton = () => {
    const skeletonparagraph = (
        <Skeleton active paragraph={{ rows: 4 }} className='page-skeleton' />
    );

    return (
        <Fragment>
            {skeletonparagraph}
            {skeletonparagraph}
            {skeletonparagraph}
        </Fragment>
    );
};