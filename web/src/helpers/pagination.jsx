import React from 'react'
import {Icon} from 'semantic-ui-react'
import { Pagination } from 'antd';
import 'antd/dist/antd.css';

function onShowSizeChange(current, pageSize) {
    console.log(current, pageSize);
  }
  

export const createPageNavigation = (pageFilter, handlePaginationClick) => {
    return (

        <Pagination 

        showSizeChanger
        onShowSizeChange={onShowSizeChange}
        defaultCurrent={1}
        total={pageFilter.count}
        
        
        /*
        
        ellipsisItem={{content: <Icon name='ellipsis horizontal'/>, icon: true}}
        firstItem={{content: <Icon name='angle double left'/>, icon: true}}
        lastItem={{content: <Icon name='angle double right'/>, icon: true}}
        prevItem={{content: <Icon name='angle left'/>, icon: true}}
        nextItem={{content: <Icon name='angle right'/>, icon: true}}
        totalPages={pageFilter.count}
        defaultActivePage={1}
           
        */ 
          />

            
             
    )
}
