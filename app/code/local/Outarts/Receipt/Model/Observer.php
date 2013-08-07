<?php

class Outarts_Receipt_Model_Observer
{
    public function saveReceiptData(Varien_Event_Observer $observer){
        $receiptData = Mage::app()->getRequest()->getParam("receipt");
        if(!$receiptData){
            return;
        }
        $quote = Mage::getSingleton("checkout/session")->getQuote();
        $quote->setReceiptType($receiptData["type"]);
        $quote->setReceiptByBuy($receiptData["by_buy"]);
        $quote->setReceiptUniformNumber($receiptData["uniform_number"]);
        $quote->save();
    }
}
