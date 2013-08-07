<?php
/**
 * Esafe Buysafe Extension
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so one can be sent to you a copy immediately.
 *
 * @category   Esafe
 * @package    Esafe_Buysafe
 * @author     Jiang Sungjin
 * @author     Jin Kang
 * @copyright  Copyright (c) 2013 Skybear Co. Ltd. (http://www.myskybear.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

class Esafe_Buysafe_Block_Redirect extends Mage_Core_Block_Abstract
{
    protected function _toHtml()
    {
        $buysafe = Mage::getModel('buysafe/buysafe');

        $form = new Varien_Data_Form();
        $form->setAction($buysafe->getUrl())
            ->setId('buysafe_checkout')
            ->setName('buysafe_checkout')
            ->setMethod('POST')
            ->setUseContainer(true);
        foreach ($buysafe->getCheckoutFormFields() as $field=>$value) {
            $form->addField($field, 'hidden', array('name'=>$field, 'value'=>$value));
        }
        $html = '<html><body>';
        $html.= $this->__('You will be redirected to Esafe in a few seconds.');
        $html.= $form->toHtml();
        $html.= '<script type="text/javascript">document.getElementById("buysafe_checkout").submit();</script>';
        $html.= '</body></html>';

        return $html;
    }
}
